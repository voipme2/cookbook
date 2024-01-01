export const summarizeTimes = (times) => {
  const regex = /(\d+\s*(?:hr|h))?(\d+\s*(?:min|m))?/;
  const totalTime = times
    .map((time) => {
      const match = regex.exec(time);
      if (!match) {
        return 0;
      }
      const hours = match[1] ? parseInt(match[1], 10) : 0;
      const minutes = match[2] ? parseInt(match[2], 10) : 0;
      return hours * 60 + minutes;
    })
    .reduce((acc, cur) => acc + cur, 0);

  // return the total time in hours and minutes
  const totalHours = Math.floor(totalTime / 60);
  const remainingMinutes = totalTime % 60;

  // if there are hours and no minutes, don't show the minutes. if there are minutes and no hours, show the minutes. if there are hours and minutes, show both
  return totalHours > 0 && remainingMinutes > 0
    ? `${totalHours} hr ${remainingMinutes} min`
    : totalHours > 0
    ? `${totalHours} hr`
    : `${remainingMinutes} min`;
};
