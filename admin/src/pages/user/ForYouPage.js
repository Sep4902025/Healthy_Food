import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectAuth } from "../../store/selectors/authSelectors";

import brow from "../../assets/images/brow.png";
import dessert from "../../assets/images/dessert.png";
import dish from "../../assets/images/mainDish.png";
import breakfast from "../../assets/images/breakfast.png";
const ForYoyPage = () => {
    const navigate = useNavigate();

  return (
    <div className="home">
      

      <div className="cate-container">
        <h1 className="cate-title">Recipes by category</h1>
        <div className="cate-list">
          <div className="cate-item">
            <div className="center-con">
              <div className="cate-i-container">
                <img src={dish} alt="Main Dishes" />
              </div>
            </div>
            <h2 className="cate-item-title">Main Dish</h2>
            <h3 className="cate-item-count">(86 dishes)</h3>
          </div>
          <div className="cate-item">
            <div className="center-con">
              <div className="cate-i-container">
                <img src={breakfast} alt="BreakFast" />
              </div>
            </div>
            <h2 className="cate-item-title">Break Fast</h2>
            <h3 className="cate-item-count">(12 break fast)</h3>
          </div>
          <div className="cate-item">
            <div className="center-con">
              <div className="cate-i-container">
                <img src={dessert} alt="Dessert" />
              </div>
            </div>
            <h2 className="cate-item-title">Dessert</h2>
            <h3 className="cate-item-count">(48 desert)</h3>
          </div>
          <div className="cate-item">
            <div className="center-con">
              <div className="cate-i-container">
                <img src={brow} alt="Browse" />
              </div>
            </div>
            <h2 className="cate-item-title">Browse All</h2>
            <h3 className="cate-item-count">(255 items)</h3>
          </div>
        </div>
      </div>

      <div className="food-container">
        <h3 className="food-slogan">Recommended For you</h3>
        <div className="food-title-container">
          
          
        </div>
        

        

        <div className="chef-container">
          <div className="chef-img-container"></div>
          <div className="chef-content"></div>
        </div>
      </div>
    </div>
  );
};

export default ForYoyPage;