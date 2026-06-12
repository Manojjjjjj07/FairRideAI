from app.core.security import hash_password
from app.core.security import verify_password

password = "skm123"

hashed = hash_password(password)

print(hashed)

print(
    verify_password(
        password,
        hashed
    )
)