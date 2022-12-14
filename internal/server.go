/*
 *   Copyright (c) 2022 CARISA
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

package internal

import (
	"context"
	"os"
	"os/signal"
	"time"

	"github.com/golang-jwt/jwt/v4"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/swpoolcontroller/internal/api"
	"github.com/swpoolcontroller/internal/crypto"
	"github.com/swpoolcontroller/internal/web"
	"github.com/swpoolcontroller/pkg/strings"
	"go.uber.org/zap"
)

const (
	infStartingServer    = "Starting the swimming pool controller server ..."
	infStartHub          = "Starting the hub"
	infStoppingWebServer = "The web server is stopping ..."
	infStoppedWebServer  = "The web server has been stopped"
	infStoppingHub       = "The hub is stopping ..."
	infStoppedServer     = "The server has been stopped"
)

type Server struct {
	factory *Factory
}

func NewServer(factory *Factory) *Server {
	return &Server{
		factory: factory,
	}
}

// Start starts the graceful http server and services
func (s *Server) Start() {
	s.factory.Log.Info(infStartingServer, zap.String("Config", s.factory.Config.String()))

	// Start server
	go func() {
		s.factory.Hubt.Register()

		s.factory.Log.Info(infStartHub)
		s.factory.Hub.Run()

		if err := s.factory.Webs.Start(s.factory.Config.Address()); err != nil {
			s.factory.Log.Info(infStoppedWebServer)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server with
	// a timeout of 10 seconds.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	s.factory.Log.Info(infStoppingWebServer)

	if err := s.factory.Webs.Shutdown(ctx); err != nil {
		s.factory.Log.Error(err.Error())
	}

	s.factory.Log.Info(infStoppingHub)
	s.factory.Hub.Stop()

	s.factory.Log.Info(infStoppedServer)
}

// Middleware configure security and behaviour of http
func (s *Server) Middleware() {
	s.factory.Webs.Use(middleware.Recover())

	// SPA web
	s.factory.Webs.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Root:   "public",
		Index:  "index.html",
		Browse: false,
		HTML5:  true,
	}))
}

// Route sets the router of app so web as api
func (s *Server) Route() {
	s.webRoute()
}

func (s *Server) webRoute() {
	// Public
	wa := s.factory.Webs.Group("/auth")
	wa.POST("/login", s.factory.WebHandler.Login.Submit)
	wa.GET("/logoff", s.factory.WebHandler.Login.Logoff)
	wa.GET(strings.Concat("/token/:", api.SName), s.factory.APIHandler.OAuth.Token)

	// API Restricted by JWT

	// Web
	wapi := s.factory.Webs.Group("/web/api")
	config := echojwt.Config{
		NewClaimsFunc: func(c echo.Context) jwt.Claims {
			return &web.JWTCustomClaims{}
		},
		SigningKey:  []byte(crypto.Key),
		TokenLookup: strings.Concat("cookie:", web.TokenName),
	}
	wapi.Use(echojwt.WithConfig(config))
	wapi.GET("/config", s.factory.WebHandler.Config.Load)
	wapi.POST("/config", s.factory.WebHandler.Config.Save)

	wapi.GET("/ws", s.factory.WebHandler.WS.Register)

	// Micro controller API
	mapi := s.factory.Webs.Group("/micro/api")

	mapi.Use(echojwt.JWT([]byte(crypto.Key)))
	mapi.GET("/action", s.factory.APIHandler.Stream.Actions)
	mapi.POST("/download", s.factory.APIHandler.Stream.Download)
}
