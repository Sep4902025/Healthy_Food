import { useState, useEffect } from "react";

function useCurrentSeason() {
  const [season] = useState(() => {
    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth >= 1 && currentMonth <= 3) return "Spring";
    if (currentMonth >= 4 && currentMonth <= 6) return "Summer";
    if (currentMonth >= 7 && currentMonth <= 9) return "Fall";
    return "Winter";
  });


  return season;
}
 
export default useCurrentSeason;
