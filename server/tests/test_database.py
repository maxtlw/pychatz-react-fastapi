from datetime import datetime

from webapp.models import User, Message


def generate_user(name: str):
    return User(username=name, hashed_password=name + '_pwd')


def test_insert_and_delete_messages(test_session):
    u_squirrel = generate_user('squirrel')
    u_monkey = generate_user('monkey')
    u_msg = Message(
        content='Message 1, from squirrel to monkey',
        timestamp=int(datetime.utcnow().timestamp()))
    u_msg.sender = u_squirrel
    u_msg.receiver = u_monkey

    test_session.add(u_squirrel)
    test_session.add(u_monkey)
    test_session.add(u_msg)
    test_session.commit()

    users_query = test_session.query(User).all()
    assert len(users_query) == 2

    assert u_msg in u_squirrel.sent_messages
    assert u_msg in u_monkey.received_messages

    test_session.delete(u_msg)
    test_session.commit()

    assert test_session.query(User).filter(User.username == u_squirrel.username).one()
    assert test_session.query(User).filter(User.username == u_monkey.username).one()
