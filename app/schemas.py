
from pydantic import BaseModel, EmailStr, ConfigDict

# Ortak özellikler
class UserBase(BaseModel):
    name: str
    surname: str
    email: EmailStr
    phone: str | None = None

# Yeni kullanıcı oluşturma
class UserCreate(UserBase):
    password: str                 #frontend butonu eklenecek,frontend formdan gelecek


# Güncelleme (opsiyonel alanlar)
class UserUpdate(UserBase):
    role: str | None = None

# Giriş için
class UserLogin(BaseModel):
    email: str
    password: str


# USER DETAİLS (Maaş Bilgisi)

class UserDetailsBase(BaseModel):
    salary: float | None = None

class UserdetailsCreate(UserDetailsBase):
    user_id: int

class UserDetailsResponse(UserDetailsBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Maaş güncelleme isteği (Swagger'da body olarak gösterilecek)
class SalaryUpdate(BaseModel):
    salary: float


# Kullanıcıyı döndürürken (şifre gösterilmez)
class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    details: UserDetailsResponse | None = None  # Maaş bilgisi sadece admin görecek


    model_config = ConfigDict(from_attributes=True)
    
