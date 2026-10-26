from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    author_id: str | None = None
    email: str
    name: str
    role: str
    phone: str | None = None
    city: str | None = None
    joined_date: str | None = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class DemoUserResponse(BaseModel):
    name: str
    email: str
    role: str
    description: str
