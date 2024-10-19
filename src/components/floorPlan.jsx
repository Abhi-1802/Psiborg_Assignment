import { useState, useEffect } from "react";
import "./floorPlan.css";
import initialPositions from "../data/initialsPositions.json";
import updatedPositions from "../data/updatedPositions.json";

const zones = {
  "Zone 1": { cx: 290, cy: 340, r: 100, startAngle: Math.PI, endAngle: 2 * Math.PI, color: "rgba(255, 0, 0, 0.2)" }, 
  "Zone 2": { cx: 290, cy: 340, r: 250, innerRadius: 150, color: "rgba(0, 0, 255, 0.2)" }, 
  "Zone 3": { cx: 290, cy: 340, r: 450, innerRadius: 280, color: "rgba(255, 255, 0, 0.2)" },
  "Zone 4": { cx: 290, cy: 340, r: 1000, innerRadius: 800, color: "rgba(0, 255, 0, 0.2)" } 
};

const svgInitialWidth = 1320;
const svgInitialHeight = 600;

const FloorPlan = () => {
  const [positions, setPositions] = useState(initialPositions);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPositions(updatedPositions); 
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const constrainPosition = (x, y) => {
    const maxX = svgInitialWidth - 10;
    const maxY = svgInitialHeight - 10;
    const minX = 10;
    const minY = 10;

    const constrainedX = Math.min(Math.max(x, minX), maxX);
    const constrainedY = Math.min(Math.max(y, minY), maxY);
    return { constrainedX, constrainedY };
  };

  const calculatePositionWithinZone = (zone, isSemiCircle = false, angleLimit = null) => {
    let angle;
    
    if (angleLimit) {
    
      angle = Math.random() * angleLimit;
    } else if (isSemiCircle) {
      angle = zone.startAngle + Math.random() * (zone.endAngle - zone.startAngle);
    } else {
      angle = Math.random() * 2 * Math.PI;
    }

    const distance = zone.innerRadius
      ? zone.innerRadius + Math.random() * (zone.r - zone.innerRadius) 
      : Math.random() * zone.r; 

    let employeeX = zone.cx + distance * Math.cos(angle);
    let employeeY = zone.cy + distance * Math.sin(angle);

    const { constrainedX, constrainedY } = constrainPosition(employeeX, employeeY);
    return { employeeX: constrainedX, employeeY: constrainedY };
  };

  const calculateZone3Position = () => {
    const { employeeX, employeeY } = calculatePositionWithinZone(zones["Zone 3"], false, Math.PI / 2);
    return { employeeX, employeeY };
  };

  const calculateZone4Position = () => {
    const { employeeX, employeeY } = calculatePositionWithinZone(zones["Zone 4"], false, Math.PI / 2);
    return { employeeX, employeeY };
  };

  const renderZones = () => {
    return Object.keys(zones).map((zoneName) => {
      const zone = zones[zoneName];
      return (
        <circle
          key={zoneName}
          cx={zone.cx}  
          cy={zone.cy}
          r={zone.r}
          fill={zone.color}
        />
      );
    });
  };

  const renderEmployees = () => {
    return positions.map((employee) => {
      const zone = zones[employee.zone];
      if (!zone) return null;

      let employeeX, employeeY;

      if (employee.zone === "Zone 1") {
        const { employeeX: x, employeeY: y } = calculatePositionWithinZone(zone, true);
        employeeX = x;
        employeeY = y;
      } else if (employee.zone === "Zone 2") {
        const { employeeX: x, employeeY: y } = calculatePositionWithinZone(zone);
        employeeX = x;
        employeeY = y;
      } else if (employee.zone === "Zone 3") {
        const { employeeX: x, employeeY: y } = calculateZone3Position();
        employeeX = x;
        employeeY = y;
      } else if (employee.zone === "Zone 4") {
        const { employeeX: x, employeeY: y } = calculateZone4Position();
        employeeX = x;
        employeeY = y;
      }

      return (
        <g key={employee._id}>
          {/* Dot for employee position */}
          <circle
            cx={employeeX}
            cy={employeeY}
            r="5"
            fill="black"
            style={{
              transition: "cx 2s ease-in-out, cy 2s ease-in-out" 
            }}
          />
          {/* Employee first name and last name initially at old position */}
          <text
            x={employeeX + 10}
            y={employeeY - 20}
            fontSize="14"
            fill="black"
            style={{
              transition: "x 2s ease-in-out, y 2s ease-in-out" 
            }}
          >
            {employee.firstName}
          </text>
          <text
            x={employeeX + 10}
            y={employeeY - 5}
            fontSize="14"
            fill="black"
            style={{
              transition: "x 2s ease-in-out, y 2s ease-in-out"
            }}
          >
            {employee.lastName}
          </text>
        </g>
      );
    });
  };

  return (
    <svg viewBox={`0 0 ${svgInitialWidth} ${svgInitialHeight}`} width="100%" height="auto" style={{ border: "1px solid black" }}>
      {renderZones()}  {/* Zones remain fixed */}
      {renderEmployees()}  {/* Employee positions within zones */}
    </svg>
  );
};

export default FloorPlan;
