from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Member(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    id_no = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    polling_centre = db.Column(db.String(100), nullable=False)
    ward = db.Column(db.String(100), nullable=False)
    constituency = db.Column(db.String(100), nullable=False)
    county = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'id_no': self.id_no,
            'phone': self.phone,
            'polling_centre': self.polling_centre,
            'ward': self.ward,
            'constituency': self.constituency,
            'county': self.county,
            'category': self.category
        }

class Poll(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    question = db.Column(db.String(500), nullable=False)
    options = db.Column(db.JSON, nullable=False)  # List of options
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'question': self.question,
            'options': self.options,
            'created_at': self.created_at.isoformat()
        }

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('member.id'), nullable=True)
    poll_id = db.Column(db.Integer, db.ForeignKey('poll.id'), nullable=True)
    response = db.Column(db.String(500), nullable=False)
    submitted_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'member_id': self.member_id,
            'poll_id': self.poll_id,
            'response': self.response,
            'submitted_at': self.submitted_at.isoformat()
        }
