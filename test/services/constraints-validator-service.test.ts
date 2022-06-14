import { expect, test } from '@oclif/test'
import {
  ConstraintsValidatorService,
  JsonValidationError
} from '../../src/services/constraints-validator-service'
import {
  BUNDLE_DESCRIPTOR_CONSTRAINTS,
  INVALID_NAME_MESSAGE
} from '../../src/models/bundle-descriptor-constraints'
import { BundleDescriptorHelper } from '../helpers/mocks/bundle-descriptor-helper'

describe('BundleDescriptorValidatorService', () => {
  test.it('No error thrown with valid object', () => {
    ConstraintsValidatorService.validateObjectConstraints(
      BundleDescriptorHelper.newBundleDescriptor(),
      BUNDLE_DESCRIPTOR_CONSTRAINTS
    )
  })

  test
    .do(() => {
      const invalidDescriptor: any =
        BundleDescriptorHelper.newBundleDescriptor()
      invalidDescriptor.microservices[0].name = undefined
      ConstraintsValidatorService.validateObjectConstraints(
        invalidDescriptor,
        BUNDLE_DESCRIPTOR_CONSTRAINTS
      )
    })
    .catch(error => {
      expect(error.message).contain('Field "name" is required')
      expect((error as JsonValidationError).jsonPath).eq(
        '$.microservices[0].name'
      )
    })
    .it('Validates required field')

  test
    .do(() => {
      const invalidDescriptor: any =
        BundleDescriptorHelper.newBundleDescriptor()
      invalidDescriptor.microfrontends[1].apiClaims = [
        {
          name: 'invalid-claim',
          type: 'invalid-type',
          serviceId: 'service-id'
        }
      ]
      ConstraintsValidatorService.validateObjectConstraints(
        invalidDescriptor,
        BUNDLE_DESCRIPTOR_CONSTRAINTS
      )
    })
    .catch(error => {
      expect(error.message).contain(
        'Field "type" is not valid. Allowed values are: internal'
      )
      expect(error.message).contain('$.microfrontends[1].apiClaims[0].type')
    })
    .it('Validates field that allows only specific values')

  test
    .do(() => {
      const invalidDescriptor: any =
        BundleDescriptorHelper.newBundleDescriptor()
      invalidDescriptor.microfrontends[1].apiClaims = [
        {
          name: 'invalid-claim',
          type: 'external',
          serviceId: 'service-id'
        }
      ]
      ConstraintsValidatorService.validateObjectConstraints(
        invalidDescriptor,
        BUNDLE_DESCRIPTOR_CONSTRAINTS
      )
    })
    .catch(error => {
      expect(error.message).contain(
        'Field "type" depends on field "bundleId" with validation'
      )
      expect(error.message).contain('Field "bundleId" is required')
      expect(error.message).contain('$.microfrontends[1].apiClaims[0].type')
    })
    .it(
      'Validates union type with a field that requires another field to exist'
    )

  test
    .do(() => {
      const invalidDescriptor: any =
        BundleDescriptorHelper.newBundleDescriptor()
      invalidDescriptor.microfrontends[1].apiClaims = [
        {
          name: 'invalid-claim',
          type: 'internal',
          serviceId: 'service-id',
          bundleId: 'my-bundle'
        }
      ]
      ConstraintsValidatorService.validateObjectConstraints(
        invalidDescriptor,
        BUNDLE_DESCRIPTOR_CONSTRAINTS
      )
    })
    .catch(error => {
      expect(error.message).contain(
        'Field "bundleId" depends on field "type" with validation'
      )
      expect(error.message).contain(
        'Field "type" is not valid. Allowed values are: external'
      )
      expect(error.message).contain('$.microfrontends[1].apiClaims[0].type')
    })
    .it(
      'Validates union type with a field that requires another field to have a specific value'
    )

  test
    .do(() => {
      const invalidDescriptor: any =
        BundleDescriptorHelper.newBundleDescriptor()
      invalidDescriptor.microfrontends[1].apiClaims = {}
      ConstraintsValidatorService.validateObjectConstraints(
        invalidDescriptor,
        BUNDLE_DESCRIPTOR_CONSTRAINTS
      )
    })
    .catch(error => {
      expect(error.message).contain('Field "apiClaims" should be an array')
      expect(error.message).contain('$.microfrontends[1].apiClaims')
    })
    .it('Validates object instead of array')

  test
    .do(() => {
      const invalidDescriptor: any =
        BundleDescriptorHelper.newBundleDescriptor()
      invalidDescriptor.microservices = undefined
      ConstraintsValidatorService.validateObjectConstraints(
        invalidDescriptor,
        BUNDLE_DESCRIPTOR_CONSTRAINTS
      )
    })
    .catch(error => {
      expect(error.message).contain('Field "microservices" is required')
      expect((error as JsonValidationError).jsonPath).eq('$.microservices')
    })
    .it('Validates required array')

  test
    .do(() => {
      const invalidDescriptor: any =
        BundleDescriptorHelper.newBundleDescriptor()
      invalidDescriptor.microfrontends[0].titles = {
        en: {
          not: 'valid'
        }
      }
      ConstraintsValidatorService.validateObjectConstraints(
        invalidDescriptor,
        BUNDLE_DESCRIPTOR_CONSTRAINTS
      )
    })
    .catch(error => {
      expect(error.message).contain(
        'Field "titles" is not valid. Should be a key-value map of strings'
      )
      expect(error.message).contain('$.microfrontends[0].titles')
    })
    .it('Validates microfrontend titles')

  test
    .do(() => {
      const invalidDescriptor: any =
        BundleDescriptorHelper.newBundleDescriptor()
      invalidDescriptor.description = []
      ConstraintsValidatorService.validateObjectConstraints(
        invalidDescriptor,
        BUNDLE_DESCRIPTOR_CONSTRAINTS
      )
    })
    .catch(error => {
      expect(error.message).contain(
        'Field "description" is not valid. Should be a string'
      )
      expect((error as JsonValidationError).jsonPath).eq('$.description')
    })
    .it('Validates primitive field wrong type')

  test
    .do(() => {
      const invalidDescriptor: any =
        BundleDescriptorHelper.newBundleDescriptor()
      invalidDescriptor.microfrontends[1].name = 'invalid mfe name'
      ConstraintsValidatorService.validateObjectConstraints(
        invalidDescriptor,
        BUNDLE_DESCRIPTOR_CONSTRAINTS
      )
    })
    .catch(error => {
      expect(error.message).contain(
        'Field "name" is not valid. ' + INVALID_NAME_MESSAGE
      )
      expect(error.message).contain('$.microfrontends[1].name')
    })
    .it('Validates name using RegExp')
})
