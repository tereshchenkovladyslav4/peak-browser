import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';
import { Observable } from 'rxjs';
import { Assignment } from '../../resources/models/assignment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProdGenApi } from '../apiService/prodgen.api';
import { Apiv2Service } from '../apiService/apiv2.service';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AssignmentHistoryService {
  constructor(
    private http: HttpClient,
    private v1Service: ProdGenApi,
    private v2Service: Apiv2Service,
  ) {}

  fetchHistoricalAssignments(): Observable<Assignment[]> {
    const headersV1 = this.v1Service.getAuthHeaders();
    const headersV2 = this.v2Service.getv2AuthHeaders();
    const url = environment.apiUrlV2 + '/assignments/enduser';
    const headers = headersV2.append('userAccessKey', headersV1.get('userAccessKey'));
    const params = new HttpParams({ fromObject: { assignmentStatusType: 'All' } });

    return this.http.get<Assignment[]>(url, { headers: headers, params: params }).pipe(
      map((results: Assignment[]) =>
        results?.map((assignment: Assignment) => ({
          ...assignment,
          // this magic allows the typeahead search to look for matches within any of these properties
          searchBy:
            assignment.course?.name +
            assignment?.course?.description +
            assignment.learningPath?.name +
            assignment.learningPath?.description +
            assignment.assessment?.testName +
            this.formatDate(assignment.assessment?.expiryDate) +
            this.formatDate(assignment.dueDate),
        })),
      ),
    );
  }

  private formatDate(date: string): string {
    if (!date) {
      return '';
    }

    return formatDate(date, 'shortDate', 'en-US');
  }
}
