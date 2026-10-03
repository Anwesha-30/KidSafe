import "./RoleAvatar.css";

export default function RoleAvatar({ role }) {
  return <span className={`role-avatar role-avatar--${role}`} aria-hidden="true">
    <span className="role-avatar__model">
      {role === "parent" ? <>
        <span className="role-avatar__person role-avatar__person--back"><span className="role-avatar__head" /><span className="role-avatar__body" /></span>
        <span className="role-avatar__person role-avatar__person--front"><span className="role-avatar__head" /><span className="role-avatar__body" /></span>
      </> : <span className="role-avatar__face"><span className="role-avatar__curl" /><span className="role-avatar__eye role-avatar__eye--left" /><span className="role-avatar__eye role-avatar__eye--right" /><span className="role-avatar__cheek role-avatar__cheek--left" /><span className="role-avatar__cheek role-avatar__cheek--right" /><span className="role-avatar__smile" /></span>}
    </span>
  </span>;
}
