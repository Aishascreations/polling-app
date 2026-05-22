from sqlalchemy.orm import Session
import models, schemas, auth

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed = auth.hash_password(user.password)
    db_user = models.User(email=user.email, username=user.username, hashed_password=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_poll(db: Session, poll: schemas.PollCreate, user_id: int):
    db_poll = models.Poll(title=poll.title, description=poll.description, creator_id=user_id)
    db.add(db_poll)
    db.flush()
    for opt in poll.options:
        db_opt = models.Option(text=opt.text, poll_id=db_poll.id)
        db.add(db_opt)
    db.commit()
    db.refresh(db_poll)
    return enrich_poll(db, db_poll)

def get_polls(db: Session, skip: int = 0, limit: int = 20):
    polls = db.query(models.Poll).order_by(models.Poll.created_at.desc()).offset(skip).limit(limit).all()
    return [enrich_poll(db, p) for p in polls]

def get_poll(db: Session, poll_id: int):
    poll = db.query(models.Poll).filter(models.Poll.id == poll_id).first()
    if poll:
        return enrich_poll(db, poll)
    return None

def enrich_poll(db: Session, poll: models.Poll):
    for opt in poll.options:
        opt.vote_count = db.query(models.Vote).filter(models.Vote.option_id == opt.id).count()
    poll.total_votes = db.query(models.Vote).filter(models.Vote.poll_id == poll.id).count()
    return poll

def has_voted(db: Session, poll_id: int, user_id: int):
    return db.query(models.Vote).filter(models.Vote.poll_id == poll_id, models.Vote.user_id == user_id).first()

def get_user_vote(db: Session, poll_id: int, user_id: int):
    return db.query(models.Vote).filter(models.Vote.poll_id == poll_id, models.Vote.user_id == user_id).first()

def get_option(db: Session, option_id: int):
    return db.query(models.Option).filter(models.Option.id == option_id).first()

def cast_vote(db: Session, poll_id: int, option_id: int, user_id: int):
    vote = models.Vote(poll_id=poll_id, option_id=option_id, user_id=user_id)
    db.add(vote)
    db.commit()

def delete_poll(db: Session, poll_id: int):
    poll = db.query(models.Poll).filter(models.Poll.id == poll_id).first()
    db.delete(poll)
    db.commit()

def close_poll(db: Session, poll_id: int):
    poll = db.query(models.Poll).filter(models.Poll.id == poll_id).first()
    poll.is_active = False
    db.commit()
    db.refresh(poll)
    return enrich_poll(db, poll)
