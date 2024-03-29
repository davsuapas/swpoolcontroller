/*
 *   Copyright (c) 2022 ELIPCERO
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

package internal_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/swpoolcontroller/internal"
)

func TestNewFactory(t *testing.T) {
	t.Parallel()

	f := internal.NewFactory()

	assert.NotNil(t, f.APIHandler, "APIHandler")
	assert.NotNil(t, f.APIHandler.Auth, "APIHandler.Auth")
	assert.NotNil(t, f.APIHandler.WS, "APIHandler.WS")
	assert.NotNil(t, f.Config, "Config")
	assert.NotNil(t, f.JWT, "JWT")
	assert.NotNil(t, f.Hub, "Hub")
	assert.NotNil(t, f.Hubt, "Hubt")
	assert.NotNil(t, f.Log, "Log")
	assert.NotNil(t, f.WebHandler, "WebHandler")
	assert.NotNil(t, f.WebHandler.AppConfig, "AppConfig")
	assert.NotNil(t, f.WebHandler.Auth, "WebHandler.Auth")
	assert.NotNil(t, f.WebHandler.Config, "WebHandler.Config")
	assert.NotNil(t, f.WebHandler.WS, "WebHandler.WS")
	assert.NotNil(t, f.Webs, "Webs")
}
