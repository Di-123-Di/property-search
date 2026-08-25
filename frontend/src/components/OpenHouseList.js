// all_data is a JSON blob of the raw feed data; OpenHouseRemarks is only
// available inside it, not as its own column, so it has to be parsed out
// here rather than read directly off the open house record.
function parseRemarks(allDataJson) {
  try {
    const parsed = JSON.parse(allDataJson);
    return parsed.OpenHouseRemarks || null;
  } catch (e) {
    return null;
  }
}

function formatDate(dateString) {
  // Parsing a plain "YYYY-MM-DD" string with `new Date(...)` treats it as
  // UTC midnight, which then renders as the previous day in any timezone
  // behind UTC. Pulling the date fields out and using the local-time
  // constructor avoids that off-by-one entirely.
  const [year, month, day] = dateString.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timeString) {
  const [hoursStr, minutesStr] = timeString.split(":");
  const hours = Number(hoursStr);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutesStr} ${period}`;
}

function OpenHouseList({ openHouses }) {
  if (openHouses.length === 0) {
    return <p className="no-open-houses">No open houses scheduled</p>;
  }

  return (
    <ul className="open-house-list">
      {openHouses.map((openHouse) => {
        const remarks = parseRemarks(openHouse.all_data);
        return (
          <li key={openHouse.id} className="open-house-item">
            <div className="open-house-date">{formatDate(openHouse.OpenHouseDate)}</div>
            <div className="open-house-time">
              {formatTime(openHouse.OH_StartTime)} &ndash; {formatTime(openHouse.OH_EndTime)}
            </div>
            {remarks && (
              <div className="open-house-remarks" data-testid="open-house-remarks">
                {remarks}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default OpenHouseList;
