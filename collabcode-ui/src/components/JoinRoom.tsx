import type React from 'react';
import { ArrowRight, Sparkles, Users } from 'lucide-react';

interface Props {
  currentUser: string;
  roomId: string;
  isLoading: boolean;
  onCurrentUserChange: (value: string) => void;
  onRoomIdChange: (value: string) => void;
  onJoin: () => void;
}

const JoinRoom: React.FC<Props> = ({
  currentUser,
  roomId,
  isLoading,
  onCurrentUserChange,
  onRoomIdChange,
  onJoin,
}) => {
  const canJoin = currentUser.trim().length > 0 && roomId.trim().length > 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onJoin();
  };

  return (
    <main className="joinRoom">
      <section className="joinRoom__card" aria-labelledby="join-room-title">
        <div className="joinRoom__badge">
          <Sparkles size={14} />
          <span>Entry Portal</span>
        </div>

        <div className="joinRoom__header">
          <h1 id="join-room-title" className="joinRoom__title">
            Join your workspace
          </h1>
          <p className="joinRoom__subtitle">
            Enter a display name and room ID to mount the collaborative editor.
          </p>
        </div>

        <form className="joinRoom__form" onSubmit={handleSubmit}>
          <label className="joinRoom__field">
            <span className="joinRoom__label">Username</span>
            <input
              className="joinRoom__input"
              type="text"
              value={currentUser}
              onChange={(event) => onCurrentUserChange(event.target.value)}
              placeholder="Adem"
              autoComplete="nickname"
              spellCheck={false}
              disabled={isLoading}
            />
          </label>

          <label className="joinRoom__field">
            <span className="joinRoom__label">Room ID</span>
            <input
              className="joinRoom__input"
              type="text"
              value={roomId}
              onChange={(event) => onRoomIdChange(event.target.value)}
              placeholder="dsi-project-room-1"
              autoComplete="off"
              spellCheck={false}
              disabled={isLoading}
            />
          </label>

          <button className="joinRoom__button" type="submit" disabled={!canJoin || isLoading}>
            {isLoading ? (
              <>
                <span className="joinRoom__spinner" aria-hidden="true" />
                Connecting
              </>
            ) : (
              <>
                <Users size={16} />
                Join Workspace
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="joinRoom__hint">
          Username is saved locally so you only need to enter it once.
        </p>
      </section>
    </main>
  );
};

export default JoinRoom;