"""
Portal Auth — Operator and Government portal authentication.

Access control is purely email-domain based:
  @rapido.com, @ola.com, @uber.com, @nammayatri.in, @indrive.com → OPERATOR
  @gov.in, @gov.com, @nic.in, @tn.gov.in, @mh.gov.in, @ka.gov.in → GOVERNMENT

JWT carries: { sub: portal_user_id, role: OPERATOR|GOVERNMENT, platform: ... }
"""
from datetime import datetime, timezone, timedelta
from typing import Optional

# pyrefly: ignore [missing-import]
from fastapi import Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# pyrefly: ignore [missing-import]
from jose import JWTError, jwt
# pyrefly: ignore [missing-import]
from passlib.context import CryptContext
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.dependencies import get_db
from app.models.portal_user import PortalUser

bearer_scheme = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------------------------------------------------------------------
# Email domain → portal role mapping
# ---------------------------------------------------------------------------

OPERATOR_DOMAINS: dict[str, str] = {
    "rapido.com":      "Rapido",
    "ola.com":         "Ola",
    "uber.com":        "Uber",
    "nammayatri.in":   "Namma Yatri",
    "indrive.com":     "InDrive",
    "bounce.bike":     "Bounce",
    "yulu.bike":       "Yulu",
}

GOVERNMENT_DOMAINS: list[str] = [
    "gov.in",
    "gov.com",   # demo/test
    "nic.in",
    "tn.gov.in",
    "mh.gov.in",
    "ka.gov.in",
    "ap.gov.in",
    "telangana.gov.in",
    "kerala.gov.in",
    "delhi.gov.in",
]


def get_domain(email: str) -> str:
    return email.split("@")[-1].lower()


def resolve_portal_role(email: str) -> tuple[Optional[str], Optional[str]]:
    """
    Returns (role, platform_or_None).
    role = 'OPERATOR' | 'GOVERNMENT' | None (not a portal email)
    """
    domain = get_domain(email)

    if domain in OPERATOR_DOMAINS:
        return "OPERATOR", OPERATOR_DOMAINS[domain]

    for gov_domain in GOVERNMENT_DOMAINS:
        if domain == gov_domain or domain.endswith("." + gov_domain):
            return "GOVERNMENT", None

    return None, None


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_portal_token(portal_user: PortalUser) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=int(settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {
        "sub": str(portal_user.id),
        "role": portal_user.role,
        "platform": portal_user.platform,
        "jurisdiction": portal_user.jurisdiction,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def get_current_portal_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> PortalUser:
    """FastAPI dependency — decodes portal JWT and returns PortalUser."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired portal token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    portal_user = db.query(PortalUser).filter(
        PortalUser.id == user_id
    ).first()

    if not portal_user or not portal_user.is_active:
        raise credentials_exception

    return portal_user


def require_operator(portal_user: PortalUser = Depends(get_current_portal_user)) -> PortalUser:
    if portal_user.role != "OPERATOR":
        raise HTTPException(status_code=403, detail="Operator access required")
    return portal_user


def require_government(portal_user: PortalUser = Depends(get_current_portal_user)) -> PortalUser:
    if portal_user.role != "GOVERNMENT":
        raise HTTPException(status_code=403, detail="Government access required")
    return portal_user
