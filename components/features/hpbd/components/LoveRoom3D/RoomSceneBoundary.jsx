"use client";

import { Component } from "react";
import styles from "../../styles/LoveRoom3D.module.scss";

export default class RoomSceneBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error) { console.warn("Không thể mở phòng 3D:", error); }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className={styles.sceneFallback} role="status">
        <p>Phòng 3D chưa mở được trên thiết bị này.</p>
        <button type="button" onClick={this.props.onUse2D}>Mở phòng 2D nhẹ</button>
      </div>
    );
  }
}
