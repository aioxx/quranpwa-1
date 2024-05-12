﻿import { useReducer, useState } from "react";
import { Link } from "react-router-dom";
import { AyatRange, NavigationMode, NavigationShortcutType, QuranData } from "../QuranData";
import { getStoredBookmarks, getStoredNavData, getStoredRecentlyReads } from "../Utilities";
import { NavigationModel } from "../components/NavBar";
import { quran_karim_114_font_chars } from "../components/SuraHeader";
import ThemeSwitch from "../components/ThemeSwitch";

function Root() {
    const storedNavData = getStoredNavData();

    const [navData, setNavData] = useState<NavigationModel>(storedNavData);
    const [quranData] = useState<QuranData>(new QuranData());

    const [navShortcutType, setNavShortcutType] = useState<NavigationShortcutType>(NavigationShortcutType.Recents);

    const recentlyReads = getStoredRecentlyReads();
    const bookmarks = getStoredBookmarks();

    const [, forceUpdate] = useReducer(x => x + 1, 0);

    const setNavMode = (navMode: NavigationMode) => {
        navData.navMode = navMode;
        setNavData(navData);
        localStorage.setItem('NavigationData', JSON.stringify(navData));
        forceUpdate();
    };

    const getCardsForAyatRanges = (navMode: NavigationMode) => {
        let items: AyatRange[] = [];

        if (navMode == NavigationMode.Juz) {
            items = quranData.juzs;
        } else if (navMode == NavigationMode.Hizb) {
            items = quranData.hizb_quarters;
        } else if (navMode == NavigationMode.Page) {
            items = quranData.pages;
        } else if (navMode == NavigationMode.Ruku) {
            items = quranData.rukus;
        }

        return <div className="row">
            {items.map(item => {
                return <div key={item.serial} className="col-md-6 col-lg-4">
                    <Link className="card theme-colored mb-3 border text-decoration-none hover-selection"
                        to={`quran?navMode=${NavigationMode[navMode]}&serial=${item.serial}`}>
                        <div className="card-body d-flex align-items-center">
                            <div className="badge border rounded-pill me-2 px-0">
                                <span className="badge ps-3" style={{ transform: 'rotate(270deg)' }}>{NavigationMode[navMode]}</span>
                                <span className="badge ps-0" style={{ fontSize: '1.5rem' }}> {item.serial}</span>
                            </div>
                            <div>
                                <div className="h5">{item.displayText}</div>
                                <div className="text-nowrap text-secondary">{item.end - item.start} Ayats | {quranData.getLengthInMinutes(item)} minutes</div>
                            </div>
                        </div>
                    </Link>
                </div>
            })}
        </div>;
    }

    const navMode = navData.navMode;

    return (<div className="container">

        <h1 className="text-center my-3">
            <img className="me-2" src="/images/quran-rehal.svg" alt="Quran Rehal" height="40" />
            <b>Quran</b> PWA
        </h1>

        <ul className="nav nav-tabs mb-3" style={{ zIndex: 9999 }}>
            <li className="nav-item">
                <a className={"nav-link border " + (navShortcutType == NavigationShortcutType.Recents ? 'active' : 'text-color-theme')} href="#"
                    onClick={() => setNavShortcutType(NavigationShortcutType.Recents)}>Recently Read</a>
            </li>
            <li className="nav-item">
                <a className={"nav-link border " + (navShortcutType == NavigationShortcutType.Bookmarks ? 'active' : 'text-color-theme')} href="#"
                    onClick={() => setNavShortcutType(NavigationShortcutType.Bookmarks)}>Bookmarks</a>
            </li>
            <li className="nav-item">
                <a className={"nav-link border " + (navShortcutType == NavigationShortcutType.QuickLinks ? 'active' : 'text-color-theme')} href="#"
                    onClick={() => setNavShortcutType(NavigationShortcutType.QuickLinks)}>Quick Links</a>
            </li>
        </ul>

        {navShortcutType == NavigationShortcutType.Recents &&
            <nav className="nav mb-3">
                {recentlyReads.map(item =>
                    <a key={item.link} className="nav-link" href={item.link}>{item.displayText}</a>)}
            </nav>
        }

        {navShortcutType == NavigationShortcutType.Bookmarks &&
            <nav className="nav mb-3">
                {bookmarks.map(item =>
                    <a key={item.link} className="nav-link" href={item.link}>{item.displayText}</a>)}
            </nav>
        }

        <hr />
        <ul className="nav nav-tabs mb-3" style={{ zIndex: 9999 }}>
            <li className="nav-item">
                <a className={"nav-link border " + (navMode == NavigationMode.Sura ? 'active' : 'text-color-theme')} href="#"
                    onClick={() => setNavMode(NavigationMode.Sura)}>Sura</a>
            </li>
            <li className="nav-item">
                <a className={"nav-link border " + (navMode == NavigationMode.Juz ? 'active' : 'text-color-theme')} href="#"
                    onClick={() => setNavMode(NavigationMode.Juz)}>Juz/Para</a>
            </li>
            <li className="nav-item">
                <a className={"nav-link border " + (navMode == NavigationMode.Hizb ? 'active' : 'text-color-theme')} href="#"
                    onClick={() => setNavMode(NavigationMode.Hizb)}>Hizb Quarter</a>
            </li>
            <li className="nav-item">
                <a className={"nav-link border " + (navMode == NavigationMode.Page ? 'active' : 'text-color-theme')} href="#"
                    onClick={() => setNavMode(NavigationMode.Page)}>Page</a>
            </li>
            <li className="nav-item">
                <a className={"nav-link border " + (navMode == NavigationMode.Ruku ? 'active' : 'text-color-theme')} href="#"
                    onClick={() => setNavMode(NavigationMode.Ruku)}>Ruku</a>
            </li>
        </ul>

        {navMode == NavigationMode.Sura &&
            <div className="row">
                {quranData.suras.map(sura => {
                    return <div key={sura.serial} className="col-md-6 col-xl-4">
                        <Link className="card theme-colored mb-3 border text-decoration-none hover-selection"
                            to={`quran?navMode=Sura&serial=${sura.serial}`}>
                            <div className="d-flex pb-2">
                                <div className="ps-3">
                                    <div style={{
                                        fontFamily: 'quran_karim_114',
                                        fontSize: '5rem',
                                        marginTop: '-1.75rem',
                                        maxHeight: '5rem'
                                    }}>
                                        {quran_karim_114_font_chars[sura.serial - 1]}
                                    </div>
                                    <p className="card-text mb-0 mt-1">
                                        <span className="me-1" style={{ filter: 'invert(0) sepia(1) saturate(0)', textShadow: 'text-shadow: 0 0 0 white' }}>{sura.type == 'Meccan' ? '🕋' : '🕌'}</span>
                                        <small>{sura.ayas} Ayats</small>
                                        <small className="d-block" style={{ filter: 'invert(0) sepia(1) saturate(0)', textShadow: 'text-shadow: 0 0 0 white' }}>⏲️ {quranData.getLengthInMinutes(sura)} minutes</small>
                                    </p>
                                </div>
                                <div className="card-body">
                                    <h5 className="card-title">{sura.serial}. {sura.tname}</h5>
                                    <p className="card-text m-0 text-nowrap">{sura.ename}</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                })}
            </div>
        }

        {navMode != NavigationMode.Sura && getCardsForAyatRanges(navMode)}

        <hr />
        <ThemeSwitch />
        <br />
        <br />
        <p>Quran PWA is a open source project. <a href="https://github.com/quranpwa/quranpwa" target="_blank">link</a></p>
        <br />
    </div>)
}

export default Root;