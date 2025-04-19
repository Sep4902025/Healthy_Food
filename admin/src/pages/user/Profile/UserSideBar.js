import "../EditUser.css";
const UserSidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="user-container-1 px-14">
      <ul className="user-list">
        <li
          className={`user-item ${activeTab === "profile" ? "selected" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <i className="fas fa-user"></i> Profile
        </li>
        <li
          className={`user-item ${
            activeTab === "favoriteFood" ? "selected" : ""
          }`}
          onClick={() => setActiveTab("favoriteFood")}
        >
          <i className="fas fa-utensils"></i> Favorite Food
        </li>
        <li
          className={`user-item ${
            activeTab === "changePassword" ? "selected" : ""
          }`}
          onClick={() => setActiveTab("changePassword")}
        >
          <i className="fas fa-key"></i> Dark Light Mode
        </li>
      </ul>
    </div>
  );
};

export default UserSidebar;
