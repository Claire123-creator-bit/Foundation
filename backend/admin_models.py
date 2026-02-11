from datetime import datetime
from website_models import db

class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    assigned_to = db.Column(db.String(100))
    priority = db.Column(db.String(20))  # High, Medium, Low
    status = db.Column(db.String(20), default='Pending')  # Pending, In Progress, Completed
    due_date = db.Column(db.DateTime)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'assigned_to': self.assigned_to,
            'priority': self.priority,
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_date': self.created_date.isoformat()
        }

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    report_type = db.Column(db.String(50))  # Financial, Activity, Issue
    submitted_by = db.Column(db.String(100))
    submission_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'report_type': self.report_type,
            'submitted_by': self.submitted_by,
            'submission_date': self.submission_date.isoformat()
        }

class FinancialRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    transaction_type = db.Column(db.String(20))  # Income, Expense
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200))
    category = db.Column(db.String(50))
    date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'transaction_type': self.transaction_type,
            'amount': self.amount,
            'description': self.description,
            'category': self.category,
            'date': self.date.isoformat()
        }