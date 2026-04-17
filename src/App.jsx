import { useState, useRef, useEffect } from "react";
import soundFile from "./assets/hover.mp3";
import bgImage from "./assets/WindowsXp.jpg";
import profileImg from "./assets/profile.jpeg";

function App() {
const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [password, setPassword] = useState("");
  const [startOpen, setStartOpen] = useState(false);
const [search, setSearch] = useState("");
const [selectedProject, setSelectedProject] = useState(null);


  const [windows, setWindows] = useState([]);
  const [time, setTime] = useState(new Date());

  const clickSound = useRef(new Audio(soundFile));

  const playSound = () => {
    clickSound.current.currentTime = 0;
    clickSound.current.volume = 0.25;
    clickSound.current.play();
  };

  // CLOCK
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // LOGIN
  const handleLogin = () => {
    if (password === "virupakshi") {
      playSound();
      setIsLoggedIn(true);
    } else {
      alert("Wrong password ❌");
    }
  };

  // OPEN WINDOW
  const openWindow = (name) => {
    playSound();

    const existing = windows.find((w) => w.name === name);

    if (existing) {
      setWindows(
        windows.map((w) =>
          w.name === name ? { ...w, minimized: false } : w
        )
      );
      return;
    }

    const newWindow = {
      name,
      x: 150 + windows.length * 40,
      y: 120 + windows.length * 40,
      z: windows.length + 1,
      minimized: false,
      maximized: false,
      prev: null,
      width: 600,   // ✅ default
      height: 500,  // ✅ default
    };

    setWindows([...windows, newWindow]);
  };

  const closeWindow = (name) => {
    playSound();
    setWindows(windows.filter((w) => w.name !== name));
  };

  const minimizeWindow = (name) => {
    playSound();
    setWindows(
      windows.map((w) =>
        w.name === name ? { ...w, minimized: true } : w
      )
    );
  };

  const restoreWindow = (name) => {
    playSound();
    const maxZ = Math.max(...windows.map((w) => w.z), 0);

    setWindows(
      windows.map((w) =>
        w.name === name
          ? { ...w, minimized: false, z: maxZ + 1 }
          : w
      )
    );
  };

const toggleMaximize = (name) => {
  playSound();

  setWindows((prev) =>
    prev.map((w) => {
      if (w.name !== name) return w;

      // 🔥 IF NOT MAXIMIZED → SAVE STATE
      if (!w.maximized) {
        return {
          ...w,
          maximized: true,
          prev: {
            x: w.x,
            y: w.y,
            width: w.width,
            height: w.height,
          },
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      }

      // 🔥 RESTORE
      return {
        ...w,
        maximized: false,
        x: w.prev?.x || 100,
        y: w.prev?.y || 100,
        width: w.prev?.width || 600,
        height: w.prev?.height || 500,
      };
    })
  );
};

  const bringToFront = (name) => {
    const maxZ = Math.max(...windows.map((w) => w.z), 0);

    setWindows(
      windows.map((w) =>
        w.name === name ? { ...w, z: maxZ + 1 } : w
      )
    );
  };

  // DRAG
const startDrag = (e, name) => {
  const rect = e.currentTarget.parentElement.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  const handleMouseMove = (e) => {
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;

    setWindows((prev) =>
      prev.map((w) => {
        if (w.name !== name || w.maximized) return w;

        return {
          ...w,
          x,
          y,
        };
      })
    );
  };

  const handleMouseUp = (e) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    setWindows((prev) =>
      prev.map((w) => {
        if (w.name !== name) return w;

        // 🔥 TOP → MAXIMIZE
        if (e.clientY < 10) {
          return {
            ...w,
            maximized: true,
            x: 0,
            y: 0,
          };
        }

// TOP → MAXIMIZE
if (e.clientY < 10) {
  return {
    ...w,
    maximized: true,
    prev: {
      x: w.x,
      y: w.y,
      width: w.width,
      height: w.height,
    },
    x: 0,
    y: 0,
    width: screenWidth,
    height: screenHeight,
  };
}

// LEFT SNAP
if (e.clientX < 50) {
  return {
    ...w,
    maximized: false,
    prev: {
      x: w.x,
      y: w.y,
      width: w.width,
      height: w.height,
    },
    x: 0,
    y: 0,
    width: screenWidth / 2,
    height: screenHeight - 40,
  };
}

// RIGHT SNAP
if (e.clientX > screenWidth - 50) {
  return {
    ...w,
    maximized: false,
    prev: {
      x: w.x,
      y: w.y,
      width: w.width,
      height: w.height,
    },
    x: screenWidth / 2,
    y: 0,
    width: screenWidth / 2,
    height: screenHeight - 40,
  };
}

        return w;
      })
    );

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};
  // ✅ RESIZE (FIXED POSITION)
  const startResize = (e, name) => {
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;

    const startWidth = e.currentTarget.parentElement.offsetWidth;
    const startHeight = e.currentTarget.parentElement.offsetHeight;

    const handleMouseMove = (e) => {
      const newWidth = startWidth + (e.clientX - startX);
      const newHeight = startHeight + (e.clientY - startY);

      setWindows((prev) =>
        prev.map((w) =>
          w.name === name && !w.maximized
            ? {
                ...w,
                width: Math.max(350, newWidth),
                height: Math.max(300, newHeight),
              }
            : w
        )
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div
        className="login-screen"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="login-box">
          <h2>Chetan OS</h2>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <button onClick={handleLogin}>Login</button>
        </div>
      </div>
    );
  }
  const searchItems = [
  { name: "Virupakshi", type: "info" },
  { name: "About", type: "app" },
  { name: "Projects", type: "app" },
  { name: "Skills", type: "app" },
  {
    name: "Who is Virupakshi?",
    answer:
      "Virupakshi M Desai is a Full Stack Developer and MCA final year student at PES University with freelancing experience and strong technical skills.",
    type: "qa",
  },
];

  return (
    <div className="desktop">
      {/* ICONS */}
      <div className="icon" onDoubleClick={() => openWindow("About")}>
        <div className="icon-img">📁</div>
        <span>About</span>
      </div>

      <div className="icon" onDoubleClick={() => openWindow("Projects")}>
        <div className="icon-img">📁</div>
        <span>Projects</span>
      </div>

      <div className="icon" onDoubleClick={() => openWindow("Skills")}>
        <div className="icon-img">📁</div>
        <span>Skills</span>
      </div>

      {/* WINDOWS */}
      {windows.map(
        (win) =>
          !win.minimized && (
            <div
              key={win.name}
              className="window"
              style={{
                top: win.y,
                left: win.x,
                width: win.maximized ? "100%" : win.width,
                height: win.maximized ? "100%" : win.height,
                zIndex: win.z,
              }}
              onMouseDown={() => bringToFront(win.name)}
            >
<div
  className="title-bar"
  onMouseDown={(e) => startDrag(e, win.name)}
  onDoubleClick={() => toggleMaximize(win.name)} // 🔥 ADD THIS
>
                <div className="title">{win.name}</div>

                <div className="controls">
                  <span onClick={() => minimizeWindow(win.name)} className="minimize"></span>
                  <span onClick={() => toggleMaximize(win.name)} className="maximize"></span>
                  <span onClick={() => closeWindow(win.name)} className="close"></span>
                </div>
              </div>

              <div className="window-content">
                {win.name === "About" && (
                  <div className="about-container">
                    <div className="about-left">
                      <div className="profile-card">
                        <div className="avatar">
                          <img src={profileImg} alt="profile" />
                          <div className="status-dot"></div>
                        </div>
                        <h2>Virupakshi M Desai</h2>
                        <p>MCA Final Year</p>
                        <span className="badge">🚀 Full Stack Developer</span>

                        <div className="mini-stats">
                          <div>
                            <h4>10+</h4>
                            <span>Projects</span>
                          </div>
                          <div>
                            <h4>Freelance</h4>
                            <span>Experience</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="about-right">
                      <div className="about-box">
                        <h3>📘 Education</h3>
                        <p>
                          MCA - PES University (Final Year)<br />
                          BCA - Karnataka University<br />
                          CGPA: 7.76
                        </p>
                      </div>

                      <div className="about-box">
                        <h3>💻 Tech Stack</h3>
                        <div className="tags">
                          <span>HTML</span>
                          <span>CSS</span>
                          <span>JavaScript</span>
                          <span>React</span>
                          <span>Node.js</span>
                          <span>Python</span>
                        </div>
                      </div>

                      <div className="about-box">
                        <h3>🚀 Experience</h3>
                        <p>
                          Freelancing BCA projects & real-world applications.
                        </p>
                      </div>

                      <div className="about-box">
                        <h3>🎯 Extra</h3>
                        <p>
                          Grim Reader (Social Media Team, PES University)
                        </p>
                      </div>

                      <div className="about-box highlight">
                        <p>
                          Passionate developer focused on building interactive,
                          user-friendly applications and continuous learning.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {win.name === "Projects" && (
  <div className="projects-container">

    {[
      {
        id: "ecom",
        title: "🛒 E-Commerce Platform",
        short: "Full stack shopping system",
        full: "A complete e-commerce platform with user authentication, cart system, admin dashboard, and order management.",
        tech: ["React", "Node.js", "MySQL"]
      },
      {
        id: "rescue",
        title: "🚑 RescuePath",
        short: "Emergency routing system",
        full: "Smart routing system using Dijkstra’s algorithm to find the fastest path for emergency vehicles.",
        tech: ["Angular", "Node.js", "MySQL"]
      },
      {
        id: "ml",
        title: "🧠 Hate Speech Detection",
        short: "ML content filtering",
        full: "Machine learning model that detects offensive and toxic content using NLP techniques.",
        tech: ["Python", "ML", "NLP"]
      },
      {
        id: "task",
        title: "📅 Task Scheduler",
        short: "Priority-based scheduling",
        full: "A smart system that schedules tasks based on priority and deadlines efficiently.",
        tech: ["Python", "Algorithms"]
      }
    ].map((proj) => (
      <div
        key={proj.id}
        className={`project-card ${selectedProject === proj.id ? "active" : ""}`}
        onClick={() =>
          setSelectedProject(selectedProject === proj.id ? null : proj.id)
        }
      >
        <h3>{proj.title}</h3>
        <p>{proj.short}</p>

        {/* EXPAND CONTENT */}
        <div className="project-expand">
          <p>{proj.full}</p>

          <div className="tech-tags">
            {proj.tech.map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    ))}

  </div>
)}
                {win.name === "Skills" && (
  <div className="skills-container">

    {[
      {
        title: "🎨 Frontend",
        skills: [
          { name: "HTML", level: 90, icon: "🌐" },
          { name: "CSS", level: 85, icon: "🎨" },
          { name: "JavaScript", level: 80, icon: "⚡" },
          { name: "React", level: 75, icon: "⚛️" },
        ],
      },
      {
        title: "⚙️ Backend",
        skills: [
          { name: "Node.js", level: 75, icon: "🟢" },
          { name: "Python", level: 80, icon: "🐍" },
        ],
      },
      {
        title: "🗄️ Database",
        skills: [
          { name: "MySQL", level: 75, icon: "💾" },
        ],
      },
      {
        title: "📊 Data Engineering",
        skills: [
          { name: "Pandas", level: 70, icon: "📦" },
          { name: "Data Analysis", level: 75, icon: "📈" },
          { name: "ETL Basics", level: 65, icon: "⚙️" },
        ],
      },
    ].map((section, i) => (
      <div key={i} className="skill-box">
        <h3>{section.title}</h3>

        {section.skills.map((s, idx) => (
          <div key={idx} className="skill">

            <div className="skill-top">
              <span>{s.icon} {s.name}</span>
              <span className="percent">{s.level}%</span>
            </div>

            <div className="bar">
              <div style={{ width: `${s.level}%` }}></div>
            </div>

          </div>
        ))}
      </div>
    ))}

  </div>
)}
              </div>

              {/* ✅ RESIZE HANDLE */}
              <div
                className="resize-handle"
                onMouseDown={(e) => startResize(e, win.name)}
              ></div>
            </div>
          )
      )}

      {/* TASKBAR */}
      
<div className="taskbar">
  {/* WINDOWS BUTTON */}
  <div
    className="taskbar-left"
    onClick={() => setStartOpen(!startOpen)}
  >
    🪟
  </div>

  <div className="taskbar-apps">
    {windows.map((win) => (
      <div
        key={win.name}
        className="taskbar-item"
        onClick={() => restoreWindow(win.name)}
      >
        {win.name}
      </div>
    ))}
  </div>

  <div className="taskbar-right">
    {time.toLocaleTimeString()}
  </div>

  {/* START MENU */}
  {startOpen && (
    <div className="start-menu">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="search-results">
        {searchItems
          .filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((item, index) => (
            <div
              key={index}
              className="result-item"
              onClick={() => {
                if (item.type === "app") {
                  openWindow(item.name);
                } else if (item.type === "qa") {
                  alert(item.answer);
                } else {
                  alert("Virupakshi M Desai - Full Stack Developer");
                }
                setStartOpen(false);
              }}
            >
              {item.name}
            </div>
          ))}
      </div>
    </div>
  )}
</div>
    </div>
  );
}

export default App;