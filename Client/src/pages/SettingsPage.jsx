import React, { useState, useEffect } from "react";
import Header from "../components/header/Header";
import { Spin } from "antd";

const SettingsPage = () => {
  const [data, setData] = useState(false); 
  const [logo, setLogo] = useState(null); 
  const [preview, setPreview] = useState(""); 
  const [isUploadAllowed, setIsUploadAllowed] = useState(true); 

  useEffect(() => {
    const fetchLastUploadedLogo = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/logo/latest`);
        if (response.ok) {
          const result = await response.json();
          if (result.fileName) {
            setPreview(`${process.env.REACT_APP_SERVER_URL}/uploads/${result.fileName}`);
          }
        } else {
          console.error("Failed to fetch last uploaded logo.");
        }
      } catch (error) {
        console.error("Error fetching last uploaded logo:", error);
      } finally {
        setData(true);
      }
    };

    fetchLastUploadedLogo();

    const lastUploadTime = localStorage.getItem("lastUploadTime");
    if (lastUploadTime) {
      const timeElapsed = Date.now() - Number(lastUploadTime);
      const oneHour = 60 * 60 * 1000;

      if (timeElapsed < oneHour) {
        setIsUploadAllowed(false);

        const timeout = setTimeout(() => {
          setIsUploadAllowed(true);
        }, oneHour - timeElapsed);

        return () => clearTimeout(timeout);
      }
    }
  }, []);

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogo(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!logo) {
      alert("Please select a logo to upload.");
      return;
    }

    if (!isUploadAllowed) {
      alert("You can upload another logo after 1 hour.");
      return;
    }

    const formData = new FormData();
    formData.append("logo", logo);

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/logo/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert("Logo uploaded successfully: " + result.fileName);
        localStorage.setItem("lastUploadTime", Date.now());
        setIsUploadAllowed(false);

        setPreview(`${process.env.REACT_APP_SERVER_URL}/uploads/${result.fileName}`);

        setTimeout(() => {
          setIsUploadAllowed(true);
        }, 60 * 60 * 1000);
      } else {
        const errorData = await response.json();
        alert("Error uploading logo: " + errorData.message);
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("An unexpected error occurred while uploading.");
    }
  };

  return (
    <>
      <Header logo={preview} />
      {data ? (
        <div className="px-6 md:pb-0 pb-20">
          <h1 className="text-4xl text-center font-bold mb-4">Settings</h1>

          {/* Logo Upload Section */}
          <div className="flex items-center gap-6">
            {/* Logo Preview */}
            {preview && (
              <div>
                <h3 className="text-md font-medium mb-2 text-center">Logo Preview:</h3>
                <img
                  src={preview}
                  alt="Logo Preview"
                  className="w-32 h-32 object-contain border bg-black"
                />
              </div>
            )}

            {/* File Input */}
            <div>
              <label htmlFor="logo-upload" className="block text-lg font-semibold mb-2">
                Upload Logo:
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                disabled={!isUploadAllowed}
              />
            </div>

            {/* Save Button */}
            <div>
              <button
                onClick={handleSave}
                className={`py-2 px-4 rounded ${
                  isUploadAllowed
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-400 text-gray-700 cursor-not-allowed"
                }`}
                disabled={!isUploadAllowed}
              >
                Save Logo
              </button>
              {!isUploadAllowed && (
                <p className="text-sm text-red-500 mt-2">
                  You can upload another logo after 1 hour.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Spin size="large" className="absolute left-1/2 top-1/2" />
      )}
    </>
  );
};

export default SettingsPage;
