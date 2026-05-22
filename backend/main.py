from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import models, schemas, crud, auth
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Polling App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = auth.get_user_from_token(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user

# Auth routes
@app.post("/auth/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, user)

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = auth.create_access_token({"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=schemas.UserOut)
def me(current_user=Depends(get_current_user)):
    return current_user

# Poll routes
@app.post("/polls", response_model=schemas.PollOut)
def create_poll(poll: schemas.PollCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.create_poll(db, poll, current_user.id)

@app.get("/polls", response_model=List[schemas.PollOut])
def list_polls(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return crud.get_polls(db, skip=skip, limit=limit)

@app.get("/polls/{poll_id}", response_model=schemas.PollOut)
def get_poll(poll_id: int, db: Session = Depends(get_db)):
    poll = crud.get_poll(db, poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    return poll

@app.post("/polls/{poll_id}/vote", response_model=schemas.PollOut)
def vote(poll_id: int, vote: schemas.VoteCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    poll = crud.get_poll(db, poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    if not poll.is_active:
        raise HTTPException(status_code=400, detail="Poll is closed")
    if crud.has_voted(db, poll_id, current_user.id):
        raise HTTPException(status_code=400, detail="You have already voted")
    option = crud.get_option(db, vote.option_id)
    if not option or option.poll_id != poll_id:
        raise HTTPException(status_code=400, detail="Invalid option")
    crud.cast_vote(db, poll_id, vote.option_id, current_user.id)
    return crud.get_poll(db, poll_id)

@app.delete("/polls/{poll_id}")
def delete_poll(poll_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    poll = crud.get_poll(db, poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    if poll.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    crud.delete_poll(db, poll_id)
    return {"message": "Poll deleted"}

@app.patch("/polls/{poll_id}/close")
def close_poll(poll_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    poll = crud.get_poll(db, poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    if poll.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.close_poll(db, poll_id)

@app.get("/polls/{poll_id}/my-vote")
def my_vote(poll_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    vote = crud.get_user_vote(db, poll_id, current_user.id)
    return {"option_id": vote.option_id if vote else None}
