from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, Text, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

from app.config import settings

engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DefensePolicyModel(Base):
    __tablename__ = "defense_policies"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    prompt_injection_scan = Column(Boolean, default=True)
    system_prompt_masking = Column(Boolean, default=True)
    rag_trust_boundary = Column(Boolean, default=True)
    tool_authorization = Column(Boolean, default=True)
    memory_validation = Column(Boolean, default=True)
    output_leakage_filter = Column(Boolean, default=True)
    sensitive_data_filter = Column(Boolean, default=True)
    canary_token_protection = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class AttackScenarioModel(Base):
    __tablename__ = "attack_scenarios"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    category = Column(String, index=True)
    severity = Column(String)
    description = Column(Text)
    payload_template = Column(Text)
    target_vector = Column(String)
    expected_exploit_indicator = Column(String)

class SecurityTraceModel(Base):
    __tablename__ = "security_traces"
    
    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, index=True)
    user_prompt = Column(Text)
    final_output = Column(Text)
    overall_status = Column(String)
    risk_level = Column(String)
    telemetry = Column(JSON)
    security_score = Column(Integer, default=100)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RAGDocumentModel(Base):
    __tablename__ = "rag_documents"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    is_poisoned = Column(Boolean, default=False)
    trust_level = Column(String, default="trusted")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AIMemoryModel(Base):
    __tablename__ = "ai_memories"
    
    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, index=True, default="lab_session_1")
    memory_key = Column(String)
    memory_value = Column(Text)
    is_poisoned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
