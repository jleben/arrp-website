# arrp-lang.org

## Technologies

- Static content uses the [Pug](https://pugjs.org/) framework.
- Static content is hosted on Google Firebase.
- Arrp compiler service runs on Google Cloud Run.

## Workflow

Prerequisites:

- Docker
- Firebase CLI
- Google Cloud CLI
- Authenticate Docker daemon with Google Cloud: `gcloud auth configure-docker`

Updating the compiler service:

1. Increment the version number in file `compiler/VERSION`. That will deploy a new service named `arrp-compiler-v<VERSION>`.
2. Update the service name in rewrite rule in file `firebase.json`.
3. Update service code in directory `compiler`.
4. Run `make compiler` to build the Docker image.
5. Run `make deploy-compiler` to deploy the service on Cloud Run.
6. Proceed with the static content workflow to test and deploy website with the new service.

Updating the website:

1.  Update UI code.
2.  Run `make ui` to generate static content in directory `public`.
3.  Run `firebase serve` to test website locally (using already deployed services on Cloud Run).
4.  Run `firebase deploy` to deploy static content and configuration in `firebase.json` to Firebase.
