﻿import { useEffect, useReducer, useState } from 'react';
import { NavigationMode, QuranData } from '../QuranData';
import { getDefaultSettings, getStoredNavData, storeRecentlyReads } from '../Utilities';
import NavBar, { NavigationModel } from '../components/NavBar';
import QuranViewer from '../components/QuranViewer';
import SettingsPanel, { SettingsModel } from '../components/SettingsPanel';

function Quran() {
    const [quranData] = useState<QuranData>(new QuranData());

    let getNavData = (): NavigationModel => {
        const storedNavData: NavigationModel = getStoredNavData()

        let searchParams = new URLSearchParams(location.search);
        const navModeStr = searchParams.get('navMode');
        if (navModeStr) {
            const navMode = NavigationMode[navModeStr as keyof typeof NavigationMode];

            const serialNumber = +(searchParams.get('serial') || storedNavData.serial);
            let ayatNumber = +(location.hash.match(/\d+/g)?.pop() || storedNavData.ayat);

            const { start, end, displayText } = quranData.getAyatRangeByNavSerial(navMode, serialNumber);
            if (ayatNumber < start || ayatNumber > end)
                ayatNumber = start + 1;

            storeRecentlyReads({
                displayText: navModeStr + ' ' + serialNumber + ' (' + displayText + ')',
                link: 'quran?' + searchParams.toString()
            });

            return {
                navMode: navMode,
                serial: serialNumber,
                ayat: ayatNumber,
            }
        }

        return storedNavData;
    };

    const storedSettingsDataString = localStorage.getItem('SettingsData');
    const storedSettingsData: SettingsModel = storedSettingsDataString ? JSON.parse(storedSettingsDataString)
        : getDefaultSettings()

    const [navData, setNavData] = useState<NavigationModel>(getNavData());
    const [settingsData, setSettingsData] = useState<SettingsModel>(storedSettingsData);

    const [, forceUpdate] = useReducer(x => x + 1, 0);

    useEffect(() => {
        onSettingsChanged(settingsData);
    }, []);

    function setNavDataToSearchParams(model: NavigationModel) {
        const url = new URL(window.location.href);

        for (let prop in model) {
            url.searchParams.delete(prop);
        }

        let navModeString = NavigationMode[model.navMode];
        url.searchParams.set('navMode', navModeString);

        url.searchParams.set('serial', model.serial.toString());

        if (model.ayat)
            url.hash = String(model.ayat);

        window.history.pushState({}, '', url.toString());
    }

    const onNavigate = (model: NavigationModel) => {
        const { start, end } = quranData.getAyatRangeByNavSerial(model?.navMode, model?.serial);
        model.ayat ??= start + 1;

        if ((model.ayat ?? 0) < start || (model.ayat ?? 0) > end)
            model.ayat = start + 1;

        setNavData(model);
        localStorage.setItem('NavigationData', JSON.stringify(model));
        setNavDataToSearchParams(model);
        forceUpdate();
        window.scrollTo(0, 0);
    }

    const onAyatSelection = (selectedAyat: number, isTranslation?: boolean) => {
        navData.ayat = selectedAyat;
        setNavData(navData);
        localStorage.setItem('NavigationData', JSON.stringify(navData));
        forceUpdate();
        location.hash = isTranslation ? 't' + selectedAyat : String(selectedAyat);
    }

    const onSettingsChanged = (model: SettingsModel) => {
        setSettingsData(model);
        localStorage.setItem('SettingsData', JSON.stringify(model));

        quranData.setTranslations(model.translations, forceUpdate);
        quranData.setTafsirs(model.tafsirs, forceUpdate);
        quranData.setRecitations(model.recitaions);
    }

    return (
        <>
            <NavBar quranData={quranData}
                navData={navData}
                onNavigate={onNavigate} />

            <QuranViewer quranData={quranData}
                navData={navData}
                settingsData={settingsData}
                onNavigate={onNavigate}
                onAyatSelection={onAyatSelection} />

            <SettingsPanel settingsData={settingsData}
                onChange={onSettingsChanged} />
        </>
    )
}

export default Quran