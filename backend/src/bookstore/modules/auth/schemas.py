from pydantic import BaseModel


class RegisterIn(BaseModel):
    name: str
    email: str
    password: str
    bio: str | None = None
    nationality: str | None = None


class LoginIn(BaseModel):
    email: str
    password: str


class AuthorMe(BaseModel):
    id: int
    name: str
    email: str
    bio: str | None = None
    profile_picture: str | None = None
    nationality: str | None = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    author: AuthorMe
