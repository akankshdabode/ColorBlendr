import { useState, useRef, useEffect } from "react";
import { FiCopy } from "react-icons/fi";
import { HexColorPicker } from "react-colorful";
import { ImCross } from "react-icons/im";

const directions = [
  { label: "Left to Right", value: "to right" },
  { label: "Right to Left", value: "to left" },
  { label: "Top to Bottom", value: "to bottom" },
  { label: "Bottom to Top", value: "to top" },
];

function ColorMixer() {
  const [colorInputs, setColorInputs] = useState(["", ""]);
  const [percentages, setPercentages] = useState([50, 50]);
  const [errors, setErrors] = useState(["", ""]);
  const [rgba, setRgba] = useState("");
  const [copiedType, setCopiedType] = useState("");
  const [bgGradient, setBgGradient] = useState("");
  const [rgbaDir, setRgbaDir] = useState("to right");
  const [activePaletteIndex, setActivePaletteIndex] = useState(null);
  const [showSky, setShowSky] = useState(true);

  const pickerRefs = useRef([]);
  const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRefs.current.every((ref) => !ref || !ref.contains(event.target))
      ) {
        setActivePaletteIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleColorChange = (index, value) => {
    const newColors = [...colorInputs];
    const newErrors = [...errors];
    newColors[index] = value;

    if (!hexRegex.test(value)) {
      newErrors[index] = "Invalid hex color code.";
    } else {
      newErrors[index] = "";
    }

    setColorInputs(newColors);
    setErrors(newErrors);
    calculateColors(newColors, percentages);
  };

  const handlePercentageChange = (index, value) => {
    const newPercents = [...percentages];
    newPercents[index] = parseInt(value);
    setPercentages(newPercents);
    calculateColors(colorInputs, newPercents);
  };

  const calculateColors = (colors, percents) => {
    const validColors = colors.filter((c) => hexRegex.test(c));
    if (validColors.length < 2) {
      setRgba("");
      return;
    }

    const totalPercent = percents.reduce((a, b) => a + b, 0) || 1;

    const rgbSum = validColors.reduce(
      (acc, hex, idx) => {
        let h = hex.slice(1);
        if (h.length === 3) h = h.split("").map((x) => x + x).join("");
        const num = parseInt(h, 16);
        const weight = percents[idx] / totalPercent;
        return [
          acc[0] + ((num >> 16) & 255) * weight,
          acc[1] + ((num >> 8) & 255) * weight,
          acc[2] + (num & 255) * weight,
        ];
      },
      [0, 0, 0]
    );

    const avg = rgbSum.map((x) => Math.round(x));
    setRgba(`rgba(${avg.join(", ")}, 0.7)`);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(""), 1500);
  };

  const applyRgbaBackground = () => {
    setShowSky(false);
    setBgGradient(`linear-gradient(${rgbaDir}, ${rgba})`);
  };

  const handleColorCircleClick = (index) => {
    setActivePaletteIndex(index === activePaletteIndex ? null : index);
  };

  const handlePickerChange = (color, index) => {
    const newColors = [...colorInputs];
    const newErrors = [...errors];

    newColors[index] = color;
    newErrors[index] = "";

    setColorInputs(newColors);
    setErrors(newErrors);
    calculateColors(newColors, percentages);
  };

  return (
    <div
      className="min-h-screen flex   items-center justify-center p-4 sm:-8 relative overflow-hidden transition-colors duration-1000"
      style={{
        backgroundColor: !showSky ? "#fff" : "transparent",
        backgroundImage: !showSky ? bgGradient : "none",
      }}
    >
       {showSky && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-white z-0"></div>
        </>
      )}

      <div className="relative backdrop-blur-xl bg-white/30 border border-white/40 rounded-xl shadow-xl sm:p-8  p-4 max-w-3xl w-full sm:w-[600px] z-10">
        <h1 className="text-xl md:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">Mix Your Colors</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {colorInputs.map((color, i) => (
            <div key={i} className="relative">
              <div className="flex items-center gap-2 relative group">
                <input
                  type="text"
                  placeholder="#RRGGBB"
                  value={color}
                  onChange={(e) => handleColorChange(i, e.target.value)}
                  className={`border rounded px-3 py-2 text-gray-900 w-full ${
                    errors[i] ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <div
                  onClick={() => handleColorCircleClick(i)}
                  className="w-6 h-6 rounded-full border-2 cursor-pointer"
                  style={{ backgroundColor: color || "#ccc" }}
                />
                <button
                  onClick={() => {
                    const newColors = [...colorInputs];
                    const newPercents = [...percentages];
                    const newErrors = [...errors];

                    newColors.splice(i, 1);
                    newPercents.splice(i, 1);
                    newErrors.splice(i, 1);

                    setColorInputs(newColors);
                    setPercentages(newPercents);
                    setErrors(newErrors);

                    if (activePaletteIndex === i) {
                      setActivePaletteIndex(null);
                    } else if (activePaletteIndex > i) {
                      setActivePaletteIndex((prev) => prev - 1);
                    }

                    calculateColors(newColors, newPercents);
                  }}
                  className="absolute -top-2 right-6  text-red-500 w-5 h-5  text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <ImCross />
                </button>
              </div>
              {errors[i] && (
                <p className="text-sm text-red-500 mt-1">{errors[i]}</p>
              )}
              {activePaletteIndex === i && (
                <div
                  ref={(el) => (pickerRefs.current[i] = el)}
                  className="absolute top-14 left-0 n z-30 bg-white p-3   border shadow-lg rounded-md"
                >
                  <HexColorPicker
                    color={colorInputs[i] || "#ffffff"}
                    onChange={(color) => handlePickerChange(color, i)}
                  />
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => {
              setColorInputs([...colorInputs, ""]);
              setPercentages([...percentages, 0]);
              setErrors([...errors, ""]);
            }}
            className="col-span-1 sm:col-span-2 bg-gray-200 hover:bg-gray-300 transition rounded mt-4 py-2 sm:py-2"
          >
            + Add Color
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 overflow-x-auto sm:pb-4 sm:mb-4 mb-4">
          {colorInputs.map((color, i) => (
            <div key={i} className="flex items-center gap-4">
              <div
                className="w-8 h-8 rounded-full border border-gray-400"
                style={{ backgroundColor: color || "#ccc" }}
              ></div>
              <span className="text-ms font-medium text-gray-700 w-12 text-center">
                {percentages[i] || 0}%
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={percentages[i] || 0}
                onChange={(e) => handlePercentageChange(i, e.target.value)}
                className="flex-1 h-2 rounded-lg appearance-none bg-gray-300"
              />
            </div>
          ))}
        </div>

        {rgba && (
          <div className="flex flex-col gap-4  space-y-2 mb-3 sm:mb-6 sm:items-center ">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center  sm:text-center text-sm sm:text-base">
              <span className="font-semibold text-gray-900 select-all text-lg sm:text-sm">
                {rgba}
              </span>
              <div className="relative">
                <FiCopy
                  className="cursor-pointer text-gray-600 hover:text-purple-600 absolute -top-8 left-25 w-4  h-4 sm:-top-3 sm:-left-3"
                  onClick={() => copyToClipboard(rgba, "rgba")}
                />
                {copiedType === "rgba" && (
                  <div className="absolute -top-16 left-30 sm:-top-12 sm:left-1  -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded animate-fade">
                    Copied!
                  </div>
                )}
              </div>
              <select
                className="border rounded w-[300px] sm:w-[130px] text-lg p-2 sm:px-2 sm:py-1 mb-2 sm:text-sm"
                value={rgbaDir}
                onChange={(e) => setRgbaDir(e.target.value)}
              >
                {directions.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              <button
                onClick={applyRgbaBackground}
                className="relative overflow-hidden sm:px-3 w-full sm:w-[150px] p-3 sm:py-3  rounded-lg cursor-pointer text-white bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-500 hover:from-fuchsia-700 hover:to-blue-600 shadow-xl transition-all duration-300 sm:text-sm text-lg  font-bold tracking-wide animate-slide-up"
              >
                <span className="relative z-10">Apply RGBA</span>
                <div className="absolute inset-0 bg-white opacity-10 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute inset-0 border border-white/30 rounded-lg"></div>
              </button>
            </div>
           </div>
        )}
      </div>
    </div>
  );
}

export default ColorMixer;




