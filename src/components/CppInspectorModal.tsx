import React, { useState } from 'react';

interface CppInspectorModalProps {
  onClose: () => void;
}

const CPP_FILES = [
  {
    filename: 'Player.h',
    title: 'Player Physics & Mechanics Header',
    lang: 'cpp',
    code: `// Player.h - Android Studio C++ NDK 2D Platformer
#pragma once
#include <string>
#include <vector>

enum class PowerUpType {
    NONE,
    DOUBLE_JUMP,
    HIGH_JUMP,
    SHIELD,
    SUPER_DASH
};

struct RectF {
    float x;
    float y;
    float width;
    float height;

    bool intersects(const RectF& other) const {
        return x < other.x + other.width &&
               x + width > other.x &&
               y < other.y + other.height &&
               y + height > other.y;
    }
};

class Player {
public:
    RectF bounds{50.0f, 450.0f, 28.0f, 38.0f};
    float vx = 0.0f;
    float vy = 0.0f;
    bool isGrounded = false;
    int facing = 1; // 1 for right, -1 for left

    // Jump mechanics
    float jumpStrength = 460.0f;
    int jumpCount = 0;
    int maxJumps = 1;
    float coyoteTimer = 0.0f;
    float jumpBufferTimer = 0.0f;

    // Power-up mechanics (2-Cube system)
    int cubesBrokenCount = 0; // Increments to 2, triggers power-up, then resets to 0!
    int totalCubesBroken = 0;
    PowerUpType activePowerUp = PowerUpType::NONE;
    float powerUpTimer = 0.0f;
    bool hasShield = false;

    // Dash
    bool isDashing = false;
    float dashTimer = 0.0f;
    float dashCooldown = 0.0f;

    // Health & Score
    int lives = 3;
    int maxLives = 3;
    int score = 0;
    int enemiesStomped = 0;
    float altitudeMeters = 0.0f;
    float invulnerableTimer = 0.0f;

    void update(float dt, float groundY);
    void jump();
    void releaseJump();
    void dash();
    void move(float dir); // -1.0 to 1.0 from touch controller
    void onUndersideCubeHit();
    void applyPowerUp(PowerUpType type, float duration);
};`,
  },
  {
    filename: 'Player.cpp',
    title: 'Player Implementation (Stomp, Kinematics, Underside Cube Hit)',
    lang: 'cpp',
    code: `// Player.cpp - Android Studio C++ Implementation
#include "Player.h"
#include <algorithm>
#include <cmath>

void Player::update(float dt, float groundY) {
    // 1. Altitude tracking (climbing up decreases Y)
    float heightClimbed = std::max(0.0f, groundY - bounds.y);
    altitudeMeters = std::floor(heightClimbed / 50.0f);

    // 2. Timers
    if (invulnerableTimer > 0.0f) invulnerableTimer -= dt;
    if (dashCooldown > 0.0f) dashCooldown -= dt;
    if (jumpBufferTimer > 0.0f) jumpBufferTimer -= dt;

    if (isGrounded) {
        coyoteTimer = 0.10f;
        jumpCount = 0;
    } else {
        coyoteTimer = std::max(0.0f, coyoteTimer - dt);
    }

    // Power-up timer countdown
    if (activePowerUp != PowerUpType::NONE && powerUpTimer > 0.0f) {
        powerUpTimer -= dt;
        if (powerUpTimer <= 0.0f) {
            // Power-up expired
            if (activePowerUp == PowerUpType::DOUBLE_JUMP) maxJumps = 1;
            if (activePowerUp == PowerUpType::HIGH_JUMP) jumpStrength = 460.0f;
            if (activePowerUp == PowerUpType::SHIELD) hasShield = false;
            activePowerUp = PowerUpType::NONE;
        }
    }

    // Dash handling
    if (isDashing) {
        dashTimer -= dt;
        if (dashTimer <= 0.0f) isDashing = false;
    }

    // Gravity
    float gravity = isDashing ? 0.0f : 960.0f;
    vy += gravity * dt;
    if (vy > 750.0f) vy = 750.0f; // Terminal velocity

    // Move player bounds
    bounds.x += vx * dt;
    bounds.y += vy * dt;
}

void Player::move(float dir) {
    if (isDashing) return;
    float maxSpeed = 240.0f;
    if (std::abs(dir) > 0.1f) {
        vx = dir * maxSpeed;
        facing = (dir > 0) ? 1 : -1;
    } else {
        vx *= 0.8f; // Friction
    }
}

void Player::jump() {
    bool canGroundJump = isGrounded || coyoteTimer > 0.0f;
    bool canAirJump = !canGroundJump && (activePowerUp == PowerUpType::DOUBLE_JUMP) && (jumpCount < maxJumps);

    if (canGroundJump) {
        vy = -jumpStrength;
        isGrounded = false;
        coyoteTimer = 0.0f;
        jumpCount = 1;
    } else if (canAirJump) {
        vy = -jumpStrength * 0.95f;
        jumpCount++;
    }
}

void Player::releaseJump() {
    // Variable jump cut
    if (vy < -60.0f) {
        vy *= 0.5f;
    }
}

void Player::dash() {
    if (dashCooldown <= 0.0f) {
        isDashing = true;
        dashTimer = (activePowerUp == PowerUpType::SUPER_DASH) ? 0.28f : 0.18f;
        dashCooldown = 0.6f;
        vx = facing * ((activePowerUp == PowerUpType::SUPER_DASH) ? 700.0f : 520.0f);
        vy = -30.0f;
    }
}

void Player::onUndersideCubeHit() {
    // Knock player downward slightly from the head-butt
    vy = std::max(60.0f, -vy * 0.2f);
    totalCubesBroken++;
    score += 200;

    // Core 2-cube requirement: triggers power-up on 2nd cube!
    cubesBrokenCount++;
    if (cubesBrokenCount >= 2) {
        cubesBrokenCount = 0; // Reset counter
        // Trigger power-up cycle (Double Jump -> Spring Boots -> Shield -> Dash)
        PowerUpType awarded = PowerUpType::DOUBLE_JUMP;
        applyPowerUp(awarded, 18.0f);
    }
}

void Player::applyPowerUp(PowerUpType type, float duration) {
    activePowerUp = type;
    powerUpTimer = duration;

    if (type == PowerUpType::DOUBLE_JUMP) {
        maxJumps = 2;
    } else if (type == PowerUpType::HIGH_JUMP) {
        jumpStrength = 630.0f; // 40% jump boost
    } else if (type == PowerUpType::SHIELD) {
        hasShield = true;
    }
}`,
  },
  {
    filename: 'PowerUpCube.h',
    title: 'Power-Up Cube (Underside Break & 2-Cube Trigger)',
    lang: 'cpp',
    code: `// PowerUpCube.h - Underside Hit Detection & Mechanics
#pragma once
#include "Player.h"

class PowerUpCube {
public:
    RectF bounds;
    bool isBroken = false;
    float hitAnimTimer = 0.0f;

    PowerUpCube(float x, float y, float w = 38.0f, float h = 38.0f)
        : bounds{x, y, w, h} {}

    // Checks if player jumped into this cube from underneath
    bool checkUndersideHit(const Player& player) {
        if (isBroken) return false;

        // Player must be moving upwards
        if (player.vy > 50.0f) return false;

        // Horizontal alignment check
        bool xOverlap = (player.bounds.x + player.bounds.width > bounds.x + 4.0f) &&
                        (player.bounds.x < bounds.x + bounds.width - 4.0f);
        if (!xOverlap) return false;

        // Player's head hits bottom of the cube
        float cubeBottom = bounds.y + bounds.height;
        float playerTop = player.bounds.y;

        return (playerTop <= cubeBottom + 8.0f && playerTop >= cubeBottom - 16.0f);
    }

    void triggerBreak(Player& player) {
        if (isBroken) return;
        isBroken = true;
        hitAnimTimer = 0.3f;
        player.onUndersideCubeHit();
    }
};`,
  },
  {
    filename: 'Enemy.h',
    title: 'Patrol Enemy & Stomp Detection',
    lang: 'cpp',
    code: `// Enemy.h - Patrol Enemy AI & Stomp Bounce
#pragma once
#include "Player.h"

class Enemy {
public:
    RectF bounds;
    float vx = 60.0f;
    float minX, maxX;
    bool isAlive = true;
    float squishTimer = 0.0f;

    Enemy(float x, float y, float min_x, float max_x)
        : bounds{x, y, 36.0f, 32.0f}, minX(min_x), maxX(max_x) {}

    void update(float dt) {
        if (!isAlive) {
            if (squishTimer > 0.0f) squishTimer -= dt;
            return;
        }

        bounds.x += vx * dt;
        if (bounds.x <= minX) {
            bounds.x = minX;
            vx = std::abs(vx);
        } else if (bounds.x + bounds.width >= maxX) {
            bounds.x = maxX - bounds.width;
            vx = -std::abs(vx);
        }
    }

    // Returns: 1 = Stomped by player, 2 = Hurt player, 0 = No collision
    int checkCollision(Player& player) {
        if (!isAlive || !bounds.intersects(player.bounds)) return 0;

        float playerFeet = player.bounds.y + player.bounds.height;
        float enemyStompLimit = bounds.y + bounds.height * 0.45f;

        // Stomp condition: player is descending and feet hit upper portion of enemy
        if (player.vy > -30.0f && playerFeet <= enemyStompLimit + 12.0f) {
            // STOMP VICTORY!
            isAlive = false;
            squishTimer = 0.35f;
            player.vy = -430.0f; // High bounce rebound!
            player.score += 350;
            player.enemiesStomped++;
            return 1;
        }

        // Otherwise damage collision
        if (player.invulnerableTimer <= 0.0f && !player.isDashing) {
            if (player.hasShield) {
                player.hasShield = false;
                player.invulnerableTimer = 1.5f;
            } else {
                player.lives--;
                player.invulnerableTimer = 2.0f;
                player.vy = -260.0f;
                player.vx = -player.facing * 180.0f;
            }
            return 2;
        }
        return 0;
    }
};`,
  },
  {
    filename: 'TouchController.h',
    title: 'Touch-based On-Screen Control System',
    lang: 'cpp',
    code: `// TouchController.h - Android Touchscreen Multi-Touch Controller
#pragma once
#include "Player.h"

struct TouchPointer {
    int id = -1;
    float startX = 0.0f;
    float startY = 0.0f;
    float currentX = 0.0f;
    float currentY = 0.0f;
    bool active = false;
};

class TouchController {
public:
    // Left on-screen D-pad / Joystick zone
    RectF dpadZone{40.0f, 600.0f, 200.0f, 200.0f};
    // Right action buttons
    RectF jumpButtonZone{800.0f, 620.0f, 90.0f, 90.0f};
    RectF dashButtonZone{700.0f, 650.0f, 75.0f, 75.0f};

    float horizontalAxis = 0.0f; // -1.0f to 1.0f
    bool jumpHeld = false;
    bool jumpPressed = false;
    bool dashPressed = false;

    void onTouchDown(int pointerId, float x, float y) {
        if (jumpButtonZone.intersects({x, y, 1, 1})) {
            jumpPressed = true;
            jumpHeld = true;
        } else if (dashButtonZone.intersects({x, y, 1, 1})) {
            dashPressed = true;
        } else if (x < 400.0f) {
            // Left D-pad zone
            float centerX = dpadZone.x + dpadZone.width / 2.0f;
            horizontalAxis = (x < centerX) ? -1.0f : 1.0f;
        }
    }

    void onTouchMove(int pointerId, float x, float y) {
        if (x < 400.0f) {
            float centerX = dpadZone.x + dpadZone.width / 2.0f;
            float diff = (x - centerX) / (dpadZone.width / 2.0f);
            horizontalAxis = std::max(-1.0f, std::min(1.0f, diff));
        }
    }

    void onTouchUp(int pointerId, float x, float y) {
        if (jumpButtonZone.intersects({x, y, 1, 1})) {
            jumpHeld = false;
        } else if (x < 400.0f) {
            horizontalAxis = 0.0f;
        }
    }

    void applyToPlayer(Player& player) {
        player.move(horizontalAxis);
        if (jumpPressed) {
            player.jump();
            jumpPressed = false;
        }
        if (!jumpHeld) {
            player.releaseJump();
        }
        if (dashPressed) {
            player.dash();
            dashPressed = false;
        }
    }
};`,
  },
  {
    filename: 'GameEngine.h',
    title: 'Game Loop, Scaling Difficulty & Level Summary',
    lang: 'cpp',
    code: `// GameEngine.h - Stage Progression & Score/Rank Summary
#pragma once
#include "Player.h"
#include "PowerUpCube.h"
#include "Enemy.h"
#include "TouchController.h"
#include <vector>

enum class GameState {
    MENU,
    PLAYING,
    PAUSED,
    LEVEL_SUMMARY,
    GAME_OVER
};

struct LevelSummary {
    int totalScore;
    int maxAltitude;
    int cubesBroken;
    int enemiesStomped;
    float clearTimeSeconds;
    char rank; // 'S', 'A', 'B', 'C'
    int stars; // 1, 2, 3
};

class GameEngine {
public:
    GameState state = GameState::MENU;
    Player player;
    TouchController touchController;
    std::vector<PowerUpCube> cubes;
    std::vector<Enemy> enemies;

    float levelTime = 0.0f;
    float summitY = -3500.0f; // Target vertical climb apex
    LevelSummary summary;

    void initLevel();
    void update(float dt);
    void render();
    void calculateLevelRank();
    float getAltitudeDifficultyMultiplier() const;
};`,
  },
  {
    filename: 'CMakeLists.txt',
    title: 'Android NDK CMake Build Script',
    lang: 'cmake',
    code: `# CMakeLists.txt - Android Studio NDK
cmake_minimum_required(VERSION 3.22.1)
project("cyberclimber")

add_library(
    cyberclimber
    SHARED
    Player.cpp
    GameEngine.cpp
    native-lib.cpp
)

find_library(log-lib log)
find_library(android-lib android)
find_library(gles-lib GLESv3)

target_link_libraries(
    cyberclimber
    \${log-lib}
    \${android-lib}
    \${gles-lib}
)`,
  },
  {
    filename: 'MainActivity.kt',
    title: 'Android Studio Kotlin Activity & JNI Bridge',
    lang: 'kotlin',
    code: `// MainActivity.kt - Android Studio Entry Point
package com.example.cyberclimber

import android.os.Bundle
import android.view.MotionEvent
import android.view.View
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Fullscreen immersive gaming mode
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            or View.SYSTEM_UI_FLAG_FULLSCREEN
            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        )

        setContentView(R.layout.activity_main)
        nativeInit()
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        val action = event.actionMasked
        val pointerIndex = event.actionIndex
        val pointerId = event.getPointerId(pointerIndex)
        val x = event.getX(pointerIndex)
        val y = event.getY(pointerIndex)

        when (action) {
            MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN ->
                nativeTouchDown(pointerId, x, y)
            MotionEvent.ACTION_MOVE ->
                nativeTouchMove(pointerId, x, y)
            MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP ->
                nativeTouchUp(pointerId, x, y)
        }
        return true
    }

    external fun nativeInit()
    external fun nativeTouchDown(pointerId: Int, x: Float, y: Float)
    external fun nativeTouchMove(pointerId: Int, x: Float, y: Float)
    external fun nativeTouchUp(pointerId: Int, x: Float, y: Float)

    companion object {
        init {
            System.loadLibrary("cyberclimber")
        }
    }
}`,
  },
];

export const CppInspectorModal: React.FC<CppInspectorModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeFile = CPP_FILES[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-5xl h-[88vh] bg-slate-950 border border-emerald-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <div className="text-sm font-black text-emerald-400 tracking-wider uppercase">
                Android Studio C++ / NDK Koodi
              </div>
              <div className="text-xs text-slate-400">
                Täydelliset C++20 lähdekoodit: Kosketusohjaus, 2-kuution power-up, vihollisten poljenta & vaikeutuva pystynousu
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
              aria-label="Kopioi koodi leikepöydälle"
            >
              <span>{copied ? '✓' : '📋'}</span>
              <span>{copied ? 'Kopioitu!' : 'Kopioi tiedosto'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold cursor-pointer"
              aria-label="Sulje"
            >
              ✕
            </button>
          </div>
        </div>

        {/* File Tabs */}
        <div className="flex overflow-x-auto bg-slate-900/60 border-b border-slate-800 px-3 py-1.5 gap-1.5 scrollbar-thin">
          {CPP_FILES.map((file, idx) => (
            <button
              key={file.filename}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === idx
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {file.filename}
            </button>
          ))}
        </div>

        {/* Code Content View */}
        <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed select-text">
          <div className="mb-2 text-xs text-slate-500 font-sans font-medium">
            // {activeFile.title}
          </div>
          <pre className="overflow-x-auto whitespace-pre font-mono selection:bg-emerald-500/30">
            <code>{activeFile.code}</code>
          </pre>
        </div>

        {/* Footer info in Finnish */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">Android Studio -ohje:</span>
            <span>Luo "Native C++" -projekti, kopioi tiedostot hakemistoon <code>app/src/main/cpp/</code></span>
          </div>
          <div className="text-[11px] text-slate-500">
            Kaikki mekaniikat (2-kuution power-up, poljenta, pystynousu) ovat 100% C++ -yhteensopivia.
          </div>
        </div>
      </div>
    </div>
  );
};
