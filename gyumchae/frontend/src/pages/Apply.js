import React, { useState } from 'react';
import './Apply.css';

const Apply = () => {
  const [formData, setFormData] = useState({
    name: '',
    taxId: '',
    phoneNumber: '',
    email: '',
    companyName: '',
    title: '',
    details: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 신청 로직 구현
    console.log('Apply:', formData);
  };

  return (
    <div className="apply-page">
      <div className="apply-container">
        <div className="apply-header">
          <h1 className="apply-main-title">Business Apply</h1>
          <p className="apply-subtitle">업체 신청하기</p>
        </div>

        <form onSubmit={handleSubmit} className="apply-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="이름을 입력해주세요."
                value={formData.name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Company Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                placeholder="업체명을 입력해주세요."
                value={formData.companyName}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Tax ID <span className="required">*</span>
              </label>
              <input
                type="text"
                name="taxId"
                placeholder="사업자등록번호를 입력해주세요."
                value={formData.taxId}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                placeholder="등록될 업체명을 작성해 주세요"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="전화번호를 입력해주세요."
                value={formData.phoneNumber}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Details</label>
              <textarea
                name="details"
                placeholder="가게에 대한 상세 정보를 입력해 주세요."
                value={formData.details}
                onChange={handleChange}
                className="form-textarea"
                rows="10"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="메일을 입력해주세요."
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-footer">
            <label className="checkbox-label">
              <input type="checkbox" className="checkbox-input" />
              <img src={`${process.env.PUBLIC_URL}/images/check_b.png`} alt="체크박스" className="checkbox-icon" />
              개인정보수집 동의 [보기]
            </label>
            <button type="button" className="inquiry-button">문의하기</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Apply;

