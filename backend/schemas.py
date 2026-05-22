from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class OptionCreate(BaseModel):
    text: str

class OptionOut(BaseModel):
    id: int
    text: str
    vote_count: int = 0
    class Config:
        from_attributes = True

class PollCreate(BaseModel):
    title: str
    description: Optional[str] = None
    options: List[OptionCreate]

class PollOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    is_active: bool
    creator_id: int
    creator: UserOut
    options: List[OptionOut]
    total_votes: int = 0
    created_at: datetime
    class Config:
        from_attributes = True

class VoteCreate(BaseModel):
    option_id: int
