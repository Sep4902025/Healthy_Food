import React from "react";
import homePicture from "../../../assets/images/homePic.png";
import { useNavigate } from "react-router-dom";

const IntroSection = ({darkMode}) => {
  const navigate = useNavigate();
  
  return (
    <div>
      <div
        className={`${
          darkMode ? "bg-[#1d6750] bg-opacity-20" : "bg-[#40B491] bg-opacity-20"
        } m-4 pl-10 pr-10`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left md:w-1/2">
            <h1
              className={`${
                darkMode ? "text-white" : "text-black"
              } m-10 text-xl md:text-4xl lg:text-[62px] font-extrabold leading-normal md:leading-[1.2] w-full md:w-2/3 lg:w-[65%] text-center md:text-left mx-auto md:mx-0`}
            >
              <span
                className={`${
                  darkMode ? "text-[#e6e62c]" : "text-[#40B491]"
                }`}
              >
                Do you want to personalize it for you?
              </span>
            </h1>
            <p
              className={`${
                darkMode ? "text-white" : "text-sm "
              } pt-5 md:text-base lg:text-lg`}
            >
              Please tell us more about yourself.
            </p>
            <button
              onClick={() => navigate("/another-page")}
              className={`${
                darkMode
                  ? "bg-[#40B491] hover:bg-[#369e7f] text-white"
                  : "bg-[#40B491] "
              } mt-5 mb-5 rounded-full px-[45px] py-[15px] rounded-full text-white font-semibold hover:bg-[#369e7f] transition duration-200 uppercase`}
            >
              Take survey here
            </button>
          </div>
          <div className="home-picture md:w-1/2 flex justify-center">
            <img
              src={homePicture}
              alt="home-picture"
              className="w-3/4 md:w-full max-w-xs md:max-w-md lg:max-w-lg mix-blend-multiply"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroSection;
