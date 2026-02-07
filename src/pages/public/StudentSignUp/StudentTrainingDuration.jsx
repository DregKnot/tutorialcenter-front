import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import otp_img_student from "../../../assets/images/otpStudentpic.jpg";
import axios from "axios";

export const StudentTrainingDuration = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [AvailableDuration, setAvailableDurations] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [durationError, setDurationError] = useState(false);
    
  return (
    <div>StudentTrainingDuration</div>
  )
}
