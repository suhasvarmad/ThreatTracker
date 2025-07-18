from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from bson import ObjectId, errors as bson_errors
from dotenv import load_dotenv
import bcrypt
import jwt
import datetime
import os
from functools import wraps
from datetime import datetime, timedelta
from bson import ObjectId, errors as bson_errors
from flask import request, jsonify
from flask_jwt_extended import jwt_required

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_EXP_DELTA_SECONDS = 86400


def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())


def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed)


def create_jwt(payload):
    payload_copy = payload.copy()
    payload_copy['exp'] = datetime.utcnow() + timedelta(seconds=JWT_EXP_DELTA_SECONDS)
    return jwt.encode(payload_copy, JWT_SECRET, algorithm='HS256')


def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'success': False, 'error': 'Token is missing'}), 401
        if token.startswith("Bearer "):
            token = token.split(" ")[1]
        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            request.user = decoded
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'error': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    organizationId = data.get('organizationId')

    if not username or not password:
        return jsonify({'success': False, 'error': 'Missing username or password'}), 400

    user = mongo.db.users.find_one({"username": username})
    if not user:
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

    if not check_password(password, user['password']):
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

    role = user['role']

    if role in ['User', 'IT']:
        if not organizationId:
            return jsonify({'success': False, 'error': 'Organization is required for this role'}), 400
        try:
            org_oid = ObjectId(organizationId)
        except bson_errors.InvalidId:
            return jsonify({'success': False, 'error': 'Invalid organization ID format'}), 400
        if org_oid != user.get('organizationId'):
            return jsonify({'success': False, 'error': 'Invalid organization'}), 401

    # 🟢 THIS BLOCK MUST BE INDENTED INSIDE THE FUNCTION
    user_info = {
        'id': str(user['_id']),
        'username': user['username'],
        'role': role
    }
    if user.get('organizationId'):
        user_info['organizationId'] = str(user['organizationId'])
        
        if role == 'Analyst':
            user_info['can_create_users'] = user.get('canCreateUsers', False)

    token = create_jwt(user_info)

    return jsonify({'success': True, 'token': token, 'user': user_info}), 200


@app.route('/api/register', methods=['POST'])
@jwt_required
def register():
    if not request.user.get('can_create_users', False):
        return jsonify({'success': False, 'error': 'Unauthorized'}), 403

    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')
    organizationId = data.get('organizationId')

    if not username or not password or not role:
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400

    if role != 'Analyst' and not organizationId:
        return jsonify({'success': False, 'error': 'OrganizationId is required for this role'}), 400

    existing_user = mongo.db.users.find_one({"username": username})
    if existing_user:
        return jsonify({'success': False, 'error': 'Username already exists'}), 409

    hashed_pw = hash_password(password)

    user_doc = {
        'username': username,
        'password': hashed_pw,
        'role': role
    }
    if role != 'Analyst':
        user_doc['organizationId'] = ObjectId(organizationId)

    mongo.db.users.insert_one(user_doc)

    return jsonify({'success': True}), 201


@app.route('/api/change-password', methods=['POST'])
def change_password():
    data = request.get_json()
    username = data.get('username')
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')

    user = mongo.db.users.find_one({"username": username})
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    if not check_password(old_password, user['password']):
        return jsonify({'success': False, 'error': 'Old password is incorrect'}), 401

    hashed_pw = hash_password(new_password)
    mongo.db.users.update_one(
        {"_id": user['_id']},
        {"$set": {"password": hashed_pw}}
    )

    return jsonify({'success': True, 'message': 'Password changed successfully'})


@app.route('/api/alerts', methods=['POST'])
@jwt_required
def create_alert():
    data = request.get_json()
    userId = data.get('userId')
    message = data.get('message')

    if not userId or not message:
        return jsonify({'success': False, 'error': 'Missing userId or message'}), 400

    # Validate userId
    try:
        user_obj_id = ObjectId(userId)
    except bson_errors.InvalidId:
        return jsonify({'success': False, 'error': 'Invalid userId'}), 400

    user = mongo.db.users.find_one({"_id": user_obj_id})
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    # Ensure user has organizationId
    org_id = user.get('organizationId')
    if not org_id:
        return jsonify({'success': False, 'error': 'User has no associated organization'}), 400

    # Save organizationId as ObjectId if not already
    if isinstance(org_id, str):
        try:
            org_id = ObjectId(org_id)
        except bson_errors.InvalidId:
            return jsonify({'success': False, 'error': 'Invalid organizationId in user'}), 400

    triggered_at = datetime.utcnow()

    new_alert = {
        'userId': str(user['_id']),
        'organizationId': org_id,
        'message': message,
        'status': 'New',
        'type': None,
        'triggeredAt': triggered_at
    }

    result = mongo.db.alerts.insert_one(new_alert)

    # Prepare response
    response_alert = {
        '_id': str(result.inserted_id),
        'userId': str(user['_id']),
        'organizationId': str(org_id),
        'message': message,
        'status': 'New',
        'type': None,
        'triggeredAt': triggered_at.isoformat() + 'Z'  # ISO string with UTC suffix
    }

    return jsonify({'success': True, 'alert': response_alert}), 201

@app.route('/api/organizations', methods=['GET'])
def get_organizations():
    organizations = list(mongo.db.organizations.find({}))
    for org in organizations:
        org['_id'] = str(org['_id'])
    return jsonify({'success': True, 'organizations': organizations})

@app.route('/api/alerts', methods=['GET'])
@jwt_required
def get_alerts():
    org_id = request.args.get('organizationId')
    query = {}

    if org_id:
        try:
            query['organizationId'] = ObjectId(org_id)
        except bson_errors.InvalidId:
            return jsonify({'success': False, 'error': 'Invalid organizationId'}), 400

    alerts = list(mongo.db.alerts.find(query))

    for alert in alerts:
        alert['_id'] = str(alert['_id'])
        alert['organizationId'] = str(alert['organizationId'])  # convert back to string for frontend

    return jsonify({'success': True, 'alerts': alerts})


@app.route('/api/alerts/<alert_id>', methods=['PUT'])
@jwt_required
def classify_alert(alert_id):
    data = request.get_json()
    updated = mongo.db.alerts.update_one(
        {"_id": ObjectId(alert_id)},
        {"$set": {"type": data.get('type'), "status": "Classified"}}
    )
    if updated.modified_count == 0:
        return jsonify({'success': False, 'error': 'Alert not found'}), 404
    return jsonify({'success': True})


@app.route('/api/it/review', methods=['GET'])
@jwt_required
def get_classified_alerts():
    org_id = request.args.get('organizationId')
    query = {'status': 'Classified'}
    if org_id:
        query['organizationId'] = org_id
    alerts = list(mongo.db.alerts.find(query))
    for alert in alerts:
        alert['_id'] = str(alert['_id'])
    return jsonify({'success': True, 'alerts': alerts})


@app.route('/api/alerts/<alert_id>/review', methods=['PUT'])
@jwt_required
def review_alert(alert_id):
    updated = mongo.db.alerts.update_one(
        {"_id": ObjectId(alert_id)},
        {"$set": {"status": 'Reviewed'}}
    )
    if updated.modified_count == 0:
        return jsonify({'success': False, 'error': 'Alert not found'}), 404
    return jsonify({'success': True})


@app.route('/api/ticket', methods=['POST'])
@jwt_required
def create_ticket():
    data = request.get_json()
    alert_id = data.get('alertId')
    description = data.get('description')

    if not alert_id or not description:
        return jsonify({'success': False, 'error': 'Missing alertId or description'}), 400

    try:
        alert_obj_id = ObjectId(alert_id)
    except bson_errors.InvalidId:
        return jsonify({'success': False, 'error': 'Invalid alertId format'}), 400

    alert = mongo.db.alerts.find_one({"_id": alert_obj_id})
    if not alert:
        return jsonify({'success': False, 'error': 'Alert not found'}), 404

    ticket_doc = {
        "alertId": str(alert_obj_id),
        "organizationId": alert["organizationId"],
        "description": description,
        "status": "Open",
        "createdAt": datetime.utcnow()
    }

    result = mongo.db.tickets.insert_one(ticket_doc)
    ticket_doc['_id'] = str(result.inserted_id)

    return jsonify({"success": True, "ticket": ticket_doc}), 201

@app.route('/api/tickets', methods=['GET'])
@jwt_required
def get_tickets():
    org_id = request.args.get('organizationId')
    query = {}
    if org_id:
        try:
            query['organizationId'] = ObjectId(org_id)
        except bson_errors.InvalidId:
            return jsonify({'success': False, 'error': 'Invalid organizationId'}), 400

    tickets = list(mongo.db.tickets.find(query))
    for ticket in tickets:
        ticket['_id'] = str(ticket['_id'])
        ticket['organizationId'] = str(ticket['organizationId'])
        ticket['alertId'] = str(ticket['alertId'])
    return jsonify({'success': True, 'tickets': tickets})


@app.route('/api/ticket/<ticket_id>', methods=['PUT'])
@jwt_required
def update_ticket(ticket_id):
    data = request.get_json()
    status = data.get('status')
    if not status:
        return jsonify({'success': False, 'error': 'Missing status'}), 400

    result = mongo.db.tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        return jsonify({'success': False, 'error': 'Ticket not found'}), 404

    return jsonify({'success': True})


@app.route('/api/test', methods=['GET'])
def test():
    try:
        mongo.db.command("ping")
        return jsonify({'success': True, 'message': 'MongoDB connected & Threat Tracker Backend Running!'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    app.run(port=5000, debug=True)
