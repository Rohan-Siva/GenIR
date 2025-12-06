import { JSX, useState } from 'react';
import LeftMenu from '../Components/LeftMenu/LeftMenu';
import MiddleWindow from '../Components/MiddleWindow/MiddleWindow';
import RightDrawer from '../Components/RightDrawer/RightDrawer';
import './MainPage.css';
import leftArrow from '../assets/leftArrow.png';

function MainPage(): JSX.Element {
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    const openDrawer = (): void => {
        setIsDrawerOpen(true);
    };

    const closeDrawer = (): void => {
        setIsDrawerOpen(false);
    };

    const clickDrawer = (): void => {
        if (isDrawerOpen) {
            closeDrawer();
        } else {
            openDrawer();
        }
    }

    return (
        <div className="main-page">
            <div className="left-menu">
                <LeftMenu />
            </div>
            <div className="middle-window">
                <MiddleWindow />
            </div>
            <div className="right-drawer">
                <RightDrawer
                    isOpen={isDrawerOpen}
                    onClose={closeDrawer}
                    title="Feedback"
                    width="400px"
                    position="right"
                >
                    <button
                        onClick={clickDrawer}
                        className="open-drawer-button"
                    >
                        <img src={leftArrow} width={20} />
                    </button>
                    <div className="drawer-content">
                        <h4>User Feedback</h4>

                        <div className="setting-item">
                            <label>Feedback of Answer</label>
                            <select className="select-dropdown">
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                            </select>
                        </div>
                    </div>
                </RightDrawer>
            </div>

        </div>


    );
}

export default MainPage;