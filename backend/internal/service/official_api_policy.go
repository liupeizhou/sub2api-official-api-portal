package service

import (
	"fmt"
	"net/url"
	"strings"

	"github.com/Wei-Shaw/sub2api/internal/config"
	infraerrors "github.com/Wei-Shaw/sub2api/internal/pkg/errors"
)

func officialAPIProviderPolicyEnabled(cfg *config.Config) bool {
	return cfg != nil && cfg.Security.OfficialAPIProviders.Enabled
}

func enforceOfficialAPIProviderPolicy(cfg *config.Config, accountType string, credentials map[string]any) error {
	if !officialAPIProviderPolicyEnabled(cfg) {
		return nil
	}

	accountType = strings.TrimSpace(accountType)
	if accountType == "" {
		return nil
	}

	allowed := map[string]struct{}{}
	for _, typ := range cfg.Security.OfficialAPIProviders.AllowedAccountTypes {
		allowed[strings.TrimSpace(typ)] = struct{}{}
	}
	if _, ok := allowed[accountType]; !ok {
		return infraerrors.BadRequest(
			"OFFICIAL_API_PROVIDER_REQUIRED",
			fmt.Sprintf("official API provider mode only allows account types: %s", strings.Join(cfg.Security.OfficialAPIProviders.AllowedAccountTypes, ", ")),
		)
	}

	if cfg.Security.OfficialAPIProviders.RequireAPIKey {
		switch accountType {
		case AccountTypeAPIKey, AccountTypeUpstream:
			if strings.TrimSpace(credentialString(credentials, "api_key")) == "" {
				return infraerrors.BadRequest("OFFICIAL_API_KEY_REQUIRED", "credentials.api_key is required in official API provider mode")
			}
		}
	}

	if accountType == AccountTypeUpstream && cfg.Security.OfficialAPIProviders.RequireBaseURLForUpstream {
		baseURL := strings.TrimSpace(credentialString(credentials, "base_url"))
		if baseURL == "" {
			return infraerrors.BadRequest("OFFICIAL_UPSTREAM_BASE_URL_REQUIRED", "credentials.base_url is required for upstream accounts in official API provider mode")
		}
		parsed, err := url.Parse(baseURL)
		if err != nil || parsed.Scheme == "" || parsed.Host == "" {
			return infraerrors.BadRequest("OFFICIAL_UPSTREAM_BASE_URL_INVALID", "credentials.base_url must be an absolute http(s) URL")
		}
		if parsed.Scheme != "https" && parsed.Scheme != "http" {
			return infraerrors.BadRequest("OFFICIAL_UPSTREAM_BASE_URL_INVALID", "credentials.base_url must use http or https")
		}
	}

	return nil
}

func credentialString(credentials map[string]any, key string) string {
	if credentials == nil {
		return ""
	}
	value, ok := credentials[key]
	if !ok || value == nil {
		return ""
	}
	if s, ok := value.(string); ok {
		return s
	}
	return fmt.Sprint(value)
}
