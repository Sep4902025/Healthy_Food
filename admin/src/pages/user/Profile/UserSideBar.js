const UserSidebar = ({ activeTab, setActiveTab }) => {
    return (
      <div className="user-container-1">
        <div className="w-[223.50px] h-[73.64px] relative">
          <div className="w-[162px] h-[70px] left-[61.50px] top-[3.64px] absolute text-black text-[32px] font-normal font-['Outfit'] tracking-tight">
            My Profile
          </div>
        </div>
  
        <ul className="user-list">
          <li className={`user-item ${activeTab === "profile" ? "selected" : ""}`} onClick={() => setActiveTab("profile")}>
            <i className="fas fa-user"></i> Profile
          </li>
          <li className={`user-item ${activeTab === "favoriteFood" ? "selected" : ""}`} onClick={() => setActiveTab("favoriteFood")}>
            <i className="fas fa-utensils"></i> Favorite Food
          </li>
          <li className={`user-item ${activeTab === "dontEatFood" ? "selected" : ""}`} onClick={() => setActiveTab("dontEatFood")}>
            <i className="fas fa-ban"></i> Don't Eat Food
          </li>
          <li className={`user-item ${activeTab === "changePassword" ? "selected" : ""}`} onClick={() => setActiveTab("changePassword")}>
            <i className="fas fa-key"></i> Change Password
          </li>
          <li className={`user-item ${activeTab === "faqs" ? "selected" : ""}`} onClick={() => setActiveTab("faqs")}>
            <i className="fas fa-question-circle"></i> FAQs
          </li>
        </ul>
      </div>
    );
  };
  
  export default UserSidebar;
  