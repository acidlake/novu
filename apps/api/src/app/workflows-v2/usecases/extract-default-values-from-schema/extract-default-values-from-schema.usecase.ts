import { JSONSchemaDto } from '@novu/shared';
import { Injectable } from '@nestjs/common';
import { ExtractDefaultValuesFromSchemaCommand } from './extract-default-values-from-schema.command';

@Injectable()
export class ExtractDefaultValuesFromSchemaUsecase {
  /**
   * Executes the use case to extract default values from the JSON Schema.
   * @param command - The command containing the JSON Schema DTO.
   * @returns A nested JSON structure with field paths and their default values.
   */
  execute(command: ExtractDefaultValuesFromSchemaCommand): Record<string, unknown> {
    const { jsonSchemaDto } = command;
    if (!jsonSchemaDto) {
      return {};
    }

    return this.extractDefaults(jsonSchemaDto);
  }

  private extractDefaults(schema: JSONSchemaDto): Record<string, any> {
    const result: Record<string, any> = {};

    if (schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        if (!isJSONSchemaDto(value)) {
          continue;
        }
        const isRequired = schema.required ? schema.required.includes(key) : false;
        if (!isRequired) {
          continue;
        }

        if (value.default !== undefined) {
          result[key] = value.default;
        } else {
          if (key.toLowerCase().trim() === 'url') {
            result[key] = 'https://www.example.com/search?query=placeholder';
          }
          result[key] = 'PREVIEW_ISSUE:REQUIRED_CONTROL_VALUE_IS_MISSING';
        }

        const nestedDefaults = this.extractDefaults(value);
        if (Object.keys(nestedDefaults).length > 0) {
          result[key] = { ...result[key], ...nestedDefaults };
        }
      }
    }

    return result;
  }
}

function isJSONSchemaDto(schema: any): schema is JSONSchemaDto {
  return schema && typeof schema === 'object' && 'type' in schema;
}