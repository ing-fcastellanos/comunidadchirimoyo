PROJECT := chirimoyo
REGION  := northamerica-south1
REPO    := containers
SERVICE := api
IMAGE   := $(REGION)-docker.pkg.dev/$(PROJECT)/$(REPO)/$(SERVICE):latest
SA      := chirimoyo-api@$(PROJECT).iam.gserviceaccount.com

.PHONY: install run compile docker_build docker_push deploy_prod

install:
	python -m venv .venv && . .venv/Scripts/activate && pip install -r requirements.txt

run:
	ENV=dev python app.py

compile:
	python -m compileall app

docker_build:
	docker build -t $(IMAGE) .

docker_push:
	docker push $(IMAGE)

# Build + push + deploy a Cloud Run (prod). Corre como la SA chirimoyo-api,
# escala a cero, API público (allow-unauthenticated). Ver ADR-0003/0006.
deploy_prod: docker_build docker_push
	gcloud run deploy $(SERVICE) \
	  --image=$(IMAGE) \
	  --project=$(PROJECT) \
	  --region=$(REGION) \
	  --platform=managed \
	  --service-account=$(SA) \
	  --allow-unauthenticated \
	  --min-instances=0 \
	  --port=8080
