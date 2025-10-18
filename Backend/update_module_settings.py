"""
Update module settings: max_attempts and chatbot enabled
"""
from app.database import SessionLocal
from app.models.module import Module
from sqlalchemy.orm.attributes import flag_modified

def update_module_settings(module_id: str, max_attempts: int = 4, chatbot_enabled: bool = True):
    db = SessionLocal()
    try:
        module = db.query(Module).filter(Module.id == module_id).first()

        if not module:
            print(f"❌ Module {module_id} not found")
            return

        print(f"📚 Module: {module.name}")
        print(f"\n🔍 Current settings:")

        assignment_config = module.assignment_config or {}
        features = assignment_config.get("features", {})

        current_max = features.get("multiple_attempts", {}).get("max_attempts", 2)
        current_chatbot = features.get("chatbot_feedback", {}).get("enabled", True)

        print(f"   max_attempts: {current_max}")
        print(f"   chatbot_enabled: {current_chatbot}")

        # Update settings
        if "features" not in assignment_config:
            assignment_config["features"] = {}

        if "multiple_attempts" not in assignment_config["features"]:
            assignment_config["features"]["multiple_attempts"] = {}

        if "chatbot_feedback" not in assignment_config["features"]:
            assignment_config["features"]["chatbot_feedback"] = {}

        assignment_config["features"]["multiple_attempts"]["max_attempts"] = max_attempts
        assignment_config["features"]["chatbot_feedback"]["enabled"] = chatbot_enabled

        module.assignment_config = assignment_config
        flag_modified(module, "assignment_config")

        db.commit()

        print(f"\n✅ Updated settings:")
        print(f"   max_attempts: {current_max} → {max_attempts}")
        print(f"   chatbot_enabled: {current_chatbot} → {chatbot_enabled}")

    finally:
        db.close()

if __name__ == '__main__':
    module_id = 'adb660ba-e5ae-4c42-8d99-dd44c377bc3c'

    # Set max_attempts to 4 and enable chatbot
    update_module_settings(module_id, max_attempts=4, chatbot_enabled=True)

    print("\n💡 Refresh your browser to see the changes!")
