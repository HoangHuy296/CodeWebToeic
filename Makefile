.PHONY: up down logs test test-be test-fe test-e2e e2e-install build package-release clean

COMPOSE := docker compose -f devops/docker/docker-compose.yml -f devops/docker/docker-compose.dev.yml --env-file devops/env/.env.dev

up:
	$(COMPOSE) up -d --build --force-recreate

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

test: test-be test-fe

test-be:
	cd backend-spring && ./mvnw test

test-fe:
	cd frontend && npm test

# E2E (Playwright) — runs against the stack at http://localhost. Requires `make up` first.
# Pass SPEC=VESR-148 to target a single ticket; default runs every committed spec.
e2e-install:
	cd e2e && npm install && npm run install:browsers

test-e2e:
	cd e2e && npm test $(if $(SPEC),-- $(SPEC).spec.ts,)

build:
	bash scripts/build-images.sh $(VERSION)

package-release:
	bash scripts/package-release.sh $(VERSION)

clean:
	$(COMPOSE) down -v
	cd backend-spring && ./mvnw clean || true
	cd frontend && rm -rf node_modules dist || true
	cd e2e && rm -rf node_modules .evidence test-results playwright-report || true