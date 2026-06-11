package service

import (
	"testing"

	"github.com/Wei-Shaw/sub2api/internal/config"
	"github.com/stretchr/testify/require"
)

func TestOfficialAPIProviderPolicyRejectsOAuth(t *testing.T) {
	cfg := officialAPITestConfig()

	err := enforceOfficialAPIProviderPolicy(cfg, AccountTypeOAuth, map[string]any{
		"access_token": "token",
	})

	require.Error(t, err)
	require.Contains(t, err.Error(), "OFFICIAL_API_PROVIDER_REQUIRED")
}

func TestOfficialAPIProviderPolicyAllowsUpstreamWithOfficialCredentials(t *testing.T) {
	cfg := officialAPITestConfig()

	err := enforceOfficialAPIProviderPolicy(cfg, AccountTypeUpstream, map[string]any{
		"api_key":  "sk-upstream",
		"base_url": "https://provider.example.com/v1",
	})

	require.NoError(t, err)
}

func TestOfficialAPIProviderPolicyRequiresUpstreamBaseURL(t *testing.T) {
	cfg := officialAPITestConfig()

	err := enforceOfficialAPIProviderPolicy(cfg, AccountTypeUpstream, map[string]any{
		"api_key": "sk-upstream",
	})

	require.Error(t, err)
	require.Contains(t, err.Error(), "OFFICIAL_UPSTREAM_BASE_URL_REQUIRED")
}

func officialAPITestConfig() *config.Config {
	return &config.Config{
		Security: config.SecurityConfig{
			OfficialAPIProviders: config.OfficialAPIProviderPolicyConfig{
				Enabled: true,
				AllowedAccountTypes: []string{
					AccountTypeAPIKey,
					AccountTypeUpstream,
					AccountTypeBedrock,
					AccountTypeServiceAccount,
				},
				RequireAPIKey:             true,
				RequireBaseURLForUpstream: true,
			},
		},
	}
}
