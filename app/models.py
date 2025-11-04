from sqlalchemy import Column, Integer, String, Boolean

try:
    from .database import Base
except ImportError:
    from database import Base  # type: ignore

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")  # 'admin' veya 'user'
    is_active = Column(Boolean, default=False)  # Hesap aktif mi?


