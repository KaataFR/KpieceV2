import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes as RouterRoutes } from 'react-router-dom';

const Home = lazy(() => import('../pages/Accueil/Home'));
const TomeHome = lazy(() => import('../pages/TomesHome/TomeHome'));
const Tome = lazy(() => import('../pages/Tome/Tome'));
const ArcsHome = lazy(() => import('../pages/ArcsHome/ArcsHome'));
const Arc = lazy(() => import('../pages/Arc/Arc'));
const Search = lazy(() => import('../pages/Search/Search'));
const ScanPage = lazy(() => import('../pages/ScansPage/ScanPage'));
const NotFoundPage = lazy(() => import('../pages/404/404'));
const Layout = lazy(() => import('../Layout/Layout'));

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<div className="spinner">Loading...</div>}>
                <Layout>
                    <RouterRoutes>
                        <Route exact path="/" element={<Home />} />
                        <Route exact path="/tomes" element={<TomeHome />} />
                        <Route exact path="/tomes/:selectedtome" element={<Tome />} />
                        <Route exact path="/arcs" element={<ArcsHome />} />
                        <Route exact path="/arcs/:selectedarc/:page" element={<Arc />} />
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