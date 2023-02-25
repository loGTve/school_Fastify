/*
* Theme Change Script
* root.ts -> #themeModeButton
* */
const THEME_MODE = {
    light: {
        name: '🚀 Light',
        bodyColor: '#FFFFFF',
        boxColor: '#FFFFFF',
        titleColor: '#28364A',
        contentColor: '#000000'
    },
    dark: {
        name: '🌃 Dark',
        bodyColor: '#19202b',
        boxColor: '#28364A',
        titleColor: '#FFFFFF',
        contentColor: '#FFFFFF'
    }
};

const changeTheme = (themeType) => {
    const selectedThemeMode = THEME_MODE[themeType];

    document.getElementById('themeModeButton').innerText = selectedThemeMode.name;

    document.body.style.backgroundColor = selectedThemeMode.bodyColor;

    document.getElementsByClassName('server-info-box')[0].style.backgroundColor = selectedThemeMode.boxColor;
    document.getElementsByClassName('info-title')[0].style.color = selectedThemeMode.titleColor;
    document.getElementsByClassName('info-content')[0].style.color = selectedThemeMode.contentColor;
    document.getElementsByClassName('server-time')[0].style.color = selectedThemeMode.contentColor;

    document.getElementsByClassName('theme-mode-button')[0].style.backgroundColor = selectedThemeMode.boxColor;
    document.getElementsByClassName('theme-mode-button')[0].style.color = selectedThemeMode.contentColor;
};

// Initial Theme
const getLocalStorageThemeMode = window.localStorage.getItem('themeMode') || 'light';
window.localStorage.setItem('themeMode', getLocalStorageThemeMode);
changeTheme(getLocalStorageThemeMode);

const onClickChangeTheme = () => {
    let activatedThemeMode = window.localStorage.getItem('themeMode');

    if (activatedThemeMode === 'light') {
        window.localStorage.setItem('themeMode', 'dark');
        activatedThemeMode = 'dark';
    } else {
        window.localStorage.setItem('themeMode', 'light');
        activatedThemeMode = 'light';
    }

    changeTheme(activatedThemeMode);
};