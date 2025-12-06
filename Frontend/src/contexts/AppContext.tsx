import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AppContextType {
    domain: string;
    responseStyle: string;
    informationSources: {
        web: boolean;
        academic: boolean;
        social: boolean;
    };
    setDomain: (domain: string) => void;
    setResponseStyle: (style: string) => void;
    setInformationSources: (sources: {
        web: boolean;
        academic: boolean;
        social: boolean;
    }) => void;
}

const defaultContext: AppContextType = {
    domain: 'Healthcare',
    responseStyle: 'Comparative Report',
    informationSources: {
        web: false,
        academic: false,
        social: false
    },
    setDomain: () => {},
    setResponseStyle: () => {},
    setInformationSources: () => {}
};

const AppContext = createContext<AppContextType>(defaultContext);

export const useAppContext = () => useContext(AppContext);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [domain, setDomain] = useState<string>(defaultContext.domain);
    const [responseStyle, setResponseStyle] = useState<string>(defaultContext.responseStyle);
    const [informationSources, setInformationSources] = useState<{
        web: boolean;
        academic: boolean;
        social: boolean;
    }>(defaultContext.informationSources);

    return (
        <AppContext.Provider
            value={{
                domain,
                responseStyle,
                informationSources,
                setDomain,
                setResponseStyle,
                setInformationSources
            }}
        >
            {children}
        </AppContext.Provider>
    );
};