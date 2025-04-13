import { useState, useEffect } from "react";

/**
 * @param {string} hemisphere 
 * @returns {string} 
 */
function useCurrentSeason(hemisphere = "northern") {
  const [season, setSeason] = useState("");

  useEffect(() => {
    
    const currentMonth = new Date().getMonth() + 1;
   
    if (hemisphere === "northern") {
      
      if (currentMonth >= 1 && currentMonth <= 3) {
        setSeason("Spring"); 
      } else if (currentMonth >= 4 && currentMonth <= 6) {
        setSeason("Summer"); 
      } else if (currentMonth >= 7 && currentMonth <= 9) {
        setSeason("Fall"); 
      } else {
        setSeason("Winter"); 
      }
    } else {
      
      if (currentMonth >= 2 && currentMonth <= 4) {
        setSeason("Fall"); 
      } else if (currentMonth >= 5 && currentMonth <= 7) {
        setSeason("Winter"); 
      } else if (currentMonth >= 8 && currentMonth <= 10) {
        setSeason("Spring"); 
      } else {
        setSeason("Summer"); 
      }
    }
  }, [hemisphere]);

  return season;
}

export default useCurrentSeason;
