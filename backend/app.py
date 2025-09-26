from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Member, Poll, Feedback
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///foundation.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    member = Member(
        name=data['name'],
        id_no=data['id_no'],
        phone=data['phone'],
        polling_centre=data['polling_centre'],
        ward=data['ward'],
        constituency=data['constituency'],
        county=data['county'],
        category=data['category']
    )
    db.session.add(member)
    db.session.commit()
    return jsonify({'message': 'Member registered successfully'})

@app.route('/members', methods=['GET'])
def get_members():
    members = Member.query.all()
    return jsonify([member.to_dict() for member in members])

@app.route('/polls', methods=['GET'])
def get_polls():
    polls = Poll.query.all()
    return jsonify([poll.to_dict() for poll in polls])

@app.route('/polls', methods=['POST'])
def create_poll():
    data = request.json
    poll = Poll(
        title=data['title'],
        question=data['question'],
        options=data['options']
    )
    db.session.add(poll)
    db.session.commit()
    return jsonify({'message': 'Poll created successfully'})

@app.route('/feedback', methods=['POST'])
def submit_feedback():
    data = request.json
    feedback = Feedback(
        member_id=data.get('member_id'),
        poll_id=data.get('poll_id'),
        response=data['response']
    )
    db.session.add(feedback)
    db.session.commit()
    return jsonify({'message': 'Feedback submitted successfully'})

@app.route('/polls/<int:poll_id>/responses', methods=['GET'])
def get_poll_responses(poll_id):
    feedbacks = Feedback.query.filter_by(poll_id=poll_id).all()
    return jsonify([feedback.to_dict() for feedback in feedbacks])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5001, debug=True)
