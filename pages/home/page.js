"use client";
import Head from "next/head";
import styles from "./home.module.css";
import Header from "../header/header";
import Footer from "../footer/footer";
import Contents from "../content/contents";
import FirstPage from "../firstPage/page";
import initMetaMask from "../../utils/metamask";
import { useDispatch, useSelector } from "react-redux";
import { getFhevmInstance } from "../../utils/fhevmInstance";
import { useEffect, useState } from "react";
import { initMetaMaskAction } from "../../action/metamaskActions";

export default function HomeView() {
  return (
    <div>
      <div className={styles.first}>
        <Header />
        <FirstPage />
      </div>
      <main className={`${styles.content}`}>
        <Contents />
      </main>
      <Footer />
    </div>
  );
}
