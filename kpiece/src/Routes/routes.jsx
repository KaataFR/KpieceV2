import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes as RouterRoutes } from 'react-router-dom';

const Home = lazy(() => import('../pages/Accueil/Home'));
const TomeHome = lazy(() => import('../pages/TomesHome/TomeHome'));
const Tome = lazy(() => import('../pages/Tome/Tome'));
const Saga = lazy(() => import('../pages/Saga/Saga'));
const Arc = lazy(() => import('../pages/Arc/Arc'));
const Search = lazy(() => import('../pages/Search/Search'));
const ScanPage = lazy(() => import('../pages/ScansPage/ScanPage'));
const NotFoundPage = lazy(() => import('../pages/404/404'));
const Layout = lazy(() => import('../Layout/Layout'));
const ScanTome = lazy(() => import('../pages/ScanTome/ScanTome'));

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<div className="spinner">Loading...</div>}>
                <Layout>
                    <RouterRoutes>
                        <Route exact path="/" element={<Home />} />
                        <Route exact path="/tomes/:tomelist" element={<TomeHome />} />
                        <Route exact path="/tomes/:tomelist/:tomenumber" element={<Tome />} />
                        <Route exact path="/tomes/:tomelist/:tomenumber/:selectedpagetome" element={<ScanTome />} />
                        <Route exact path="/saga" element={<Saga />} />
                        <Route exact path="/saga/:saga/:selectedarc" element={<Arc />} />
                        <Route exact path="/search/:searchtext" element={<Search />} />
                        <Route exact path="/scan/:scansaga/:scanarc/:selectedscan/:selectedpagescan" element={<ScanPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </RouterRoutes>
                </Layout>
            </Suspense>
        </BrowserRouter>
    );
};

export default AppRoutes;