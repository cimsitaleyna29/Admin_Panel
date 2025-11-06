
from pydantic import BaseModel, EmailStr, ConfigDict

# Ortak özellikler
class UserBase(BaseModel):
    name: str
    surname: str
    email: EmailStr
    phone: str | None = None

# Yeni kullanıcı oluşturma
class UserCreate(UserBase):
    password: str                  #frontend butonu eklenecek

# Güncelleme (opsiyonel alanlar)
class UserUpdate(UserBase):
    role: str | None = None

# Giriş için
class UserLogin(BaseModel):
    email: str
    password: str

# Kullanıcıyı döndürürken (şifre gösterilmez)
class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)



