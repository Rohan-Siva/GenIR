// Modified LeftMenu.tsx
import React, { ChangeEvent } from 'react';
import './LeftMenu.css';
import ryan from "../../../public/user-image.png";
import setting from "../../../public/uil_setting.png";
import sideBarCollapse from "../../../public/iconoir_sidebar-collapse.png";
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

const LeftMenu: React.FC = () => {
    const { user } = useAuth();
    const {
        domain,
        responseStyle,
        informationSources,
        setDomain,
        setResponseStyle,
        setInformationSources
    } = useAppContext();

    const handleDomainChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setDomain(e.target.value);
    };

    const handleResponseStyleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setResponseStyle(e.target.value);
    };

    const handleSourceChange = (source: 'web' | 'academic' | 'social', checked: boolean) => {
        setInformationSources({
            ...informationSources,
            [source]: checked
        });
    };

    return (
        <div className="left-menu">
            <div className="hidding-button">
                <img src={sideBarCollapse} alt="" width={30} />
            </div>
            <div className="NewQuery">
                <div className="text">New Query</div>
            </div>
            <div className="container">
                <ul>
                    <li>
                        <form>
                            <div className="input-group">
                                <div className="text">Domain</div>
                                <select value={domain} onChange={handleDomainChange}>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Creative & Design">Creative & Design</option>
                                    <option value="Business & Professional">Business & Professional</option>
                                    <option value="Science & Technology">Science & Technology</option>
                                    <option value="Social Sciences & Humanities">Social Sciences & Humanities</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <div className="text">Response Style</div>
                                <select value={responseStyle} onChange={handleResponseStyleChange}>
                                    <option value="Comparative Report">Comparative Report</option>
                                    <option value="Concise">Concise</option>
                                    <option value="Explanatory">Explanatory</option>
                                    <option value="In-Depth Analysis">In-Depth Analysis</option>
                                    <option value="Step-by-step guide">Step-by-step guide</option>
                                </select>
                            </div>
                            <div className="input-group checkBox-group">
                                <div className="text">Information Sources</div>
                                <div className="info-checkBox">
                                    <input
                                        type='checkbox'
                                        checked={informationSources.web}
                                        onChange={(e) => handleSourceChange('web', e.target.checked)}
                                    />
                                    <span>Web</span>
                                </div>
                                <div className="info-checkBox">
                                    <input
                                        type='checkbox'
                                        checked={informationSources.academic}
                                        onChange={(e) => handleSourceChange('academic', e.target.checked)}
                                    />
                                    <span>Academic</span>
                                </div>
                                <div className="info-checkBox">
                                    <input
                                        type='checkbox'
                                        checked={informationSources.social}
                                        onChange={(e) => handleSourceChange('social', e.target.checked)}
                                    />
                                    <span>Social</span>
                                </div>
                            </div>
                        </form>
                    </li>
                </ul>
            </div>

            <div className="searching-history">
                <div>Searching History</div>
            </div>
            <div className="user-profile">
                <div className="image-group">
                    <img src={ryan} alt="User Profile" width={60} />
                    <div className="text-group">
                        <div className="name">{user?.username || 'User'}</div>
                        <div className="type">Current User</div>
                    </div>
                </div>

                <div className="setting-logo image-group" onClick={() => window.location.href = '/profile'} style={{ cursor: 'pointer' }}>
                    <img src={setting} alt="Settings" width={26} />
                </div>
            </div>
        </div>
    );
};

export default LeftMenu;